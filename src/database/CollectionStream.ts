import DatabaseSerializer from "../serialization/DatabaseSerializer";
import DocumentSnapshot from "./DocumentSnapshot";
import DatabasePlugin from "./DatabasePlugin";
import CollectionReference from "./CollectionReference";
import CollectionSnapshot from "./CollectionSnapshot";
import { CollectionStreamCallback, StreamChanges } from "./DatabaseTypes";

/**
 * A CollectionSream is responsible for establishing a subscription to a collection,
 * routing updates to that collection to handlers, and providing handlers with the
 * most recent version of the collection should they request it on connection.
 */
class CollectionStream {
  public databasePlugin: DatabasePlugin;

  public collectionReference: CollectionReference;

  public handlers: CollectionStreamCallback[];

  private subscribed: boolean = false;

  /**
   * Initialising a CollectionStream requires providing a DatabasePlugin from which
   * the CollectionStream will communicate to the database service. Further, it requires
   * a targetCollectionReference.
   *
   * @param {DatabasePlugin} databasePlugin
   * @param {CollectionReference} collectionReference
   */
  constructor(databasePlugin: DatabasePlugin, collectionReference: CollectionReference) {
    this.databasePlugin = databasePlugin;
    this.collectionReference = collectionReference;
    this.handlers = [];
    this.subscribe();
  }

  /**
   * Registers a handler.
   *
   * @param {Function} handler
   */
  register(handler: CollectionStreamCallback) {
    this.handlers.push(handler);
  }

  private async subscribe() {
    if (this.subscribed) return;

    const client = this.databasePlugin.client;

    const { subscription } = await client.invoke("subscribeCollection", {
      ref: DatabaseSerializer.serializeCollectionReference(this.collectionReference)
    });

    client.socket.on(subscription.id, this.handleUpdate.bind(this));

    this.subscribed = true;
  }

  private handleUpdate(update: StreamChanges) {
    const oldSnapshot = update.oldSnapshot && new DocumentSnapshot(update.oldSnapshot.ref, update.oldSnapshot.data);
    const newSnapshot = update.newSnapshot && new DocumentSnapshot(update.newSnapshot.ref, update.newSnapshot.data);

    this.handlers.forEach(handler =>
      handler({
        changeType: update.changeType,
        newSnapshot,
        oldSnapshot
      })
    );
  }
}

export default CollectionStream;
