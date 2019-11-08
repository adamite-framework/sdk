import CollectionSnapshot from "./CollectionSnapshot";
import DocumentSnapshot from "./DocumentSnapshot";

export type CollectionOrderByRule = string[];

export type CollectionWhereComparision =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "array-contains"
  | "array-not-contains"
  | "matches"
  | "not-matches";

export type CollectionWhereRule = [string, CollectionWhereComparision, any];

export type CollectionQuery = {
  limit: number;
  orderBy: CollectionOrderByRule[];
  where: CollectionWhereRule[];
};

export type StreamChanges = {
  changeType: string;
  oldSnapshot: DocumentSnapshot | undefined;
  newSnapshot: DocumentSnapshot | undefined;
};

export type StreamOptions = { initialValues: boolean };

export type CollectionSnapshotCallback = (snapshot: CollectionSnapshot, changes?: StreamChanges) => void;

export type CollectionStreamCallback = (changes: StreamChanges) => void;

export type DocumentSnapshotCallback = (snapshot: DocumentSnapshot, changes?: StreamChanges) => void;

export type DocumentStreamCallback = (changes: StreamChanges) => void;

export type UpdateOptions = {
  replace: boolean;
};
