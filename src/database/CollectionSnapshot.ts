import DatabaseDeserializer from "../serialization/DatabaseDeserializer";
import DocumentSnapshot from "./DocumentSnapshot";
import CollectionReference from "./CollectionReference";
import {
  SerializedDocumentRef,
  SerializedCollectionRef
} from "../serialization/SerializationTypes";

class CollectionSnapshot {
  public ref: CollectionReference;

  public docs: DocumentSnapshot[];

  constructor(ref: CollectionReference, docs = []) {
    this.ref = ref;

    this.docs = docs.map(
      ({ ref, data }: { ref: SerializedDocumentRef; data: any }) =>
        new DocumentSnapshot(
          DatabaseDeserializer.deserializeDocumentReference(ref),
          data
        )
    );
  }

  get name() {
    return this.ref.name;
  }

  mutate(
    changeType: string,
    oldSnapshot: DocumentSnapshot,
    newSnapshot: DocumentSnapshot
  ) {
    if (changeType === "create") {
      this._handleCreate(newSnapshot);
    } else if (changeType === "delete") {
      this._handleDelete(oldSnapshot);
    } else if (changeType === "update") {
      this._handleUpdate(newSnapshot, oldSnapshot);
    }

    const mutatedSnapshot = new CollectionSnapshot(this.ref);
    mutatedSnapshot.docs = this.docs;
    return mutatedSnapshot;
  }

  _handleCreate(newSnapshot: DocumentSnapshot) {
    this.docs = [...this.docs, newSnapshot];
  }

  _handleDelete(newSnapshot: DocumentSnapshot) {
    const index = this.docs.findIndex(
      snapshot => snapshot.ref.id === newSnapshot.ref.id
    );
    if (index === -1) return;

    this.docs = [...this.docs.slice(0, index), ...this.docs.slice(index + 1)];
  }

  _handleUpdate(newSnapshot: DocumentSnapshot, oldSnapshot: DocumentSnapshot) {
    const index = this.docs.findIndex(
      snapshot => snapshot.ref.id === oldSnapshot.ref.id
    );
    if (index === -1) return;

    this.docs = [
      ...this.docs.slice(0, index),
      newSnapshot,
      ...this.docs.slice(index + 1)
    ];
  }
}

export default CollectionSnapshot;