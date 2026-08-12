import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { SimRequest } from "~~/components/simi/types/request";

const COLLECTION = "simiRequests";

export async function createSimiRequest(
  request: SimRequest,
) {
  await setDoc(
    doc(db, COLLECTION, request.requestId),
    {
      ...request,
      deadline: request.deadline.toString(),
    },
  );
}

export async function updateSimiRequest(
  requestId: string,
  data: Partial<SimRequest>,
) {
  const cleanData = {
    ...data,
    ...(data.deadline !== undefined
      ? { deadline: data.deadline.toString() }
      : {}),
  };

  await updateDoc(
    doc(db, COLLECTION, requestId),
    cleanData,
  );
}

export function subscribeToSimiRequests(
  callback: (requests: SimRequest[]) => void,
) {
  return onSnapshot(
    collection(db, COLLECTION),
    snapshot => {
      const requests = snapshot.docs
        .filter(docSnap => docSnap.id !== "demo")
        .map(docSnap => {
          const data = docSnap.data();

          return {
            ...data,
            requestId: docSnap.id,
            deadline: BigInt(data.deadline),
          } as SimRequest;
        });

      callback(requests);
    },
  );
}