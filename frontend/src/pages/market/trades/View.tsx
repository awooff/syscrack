import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";
import toast from "react-hot-toast";
import { LoadingFallback, TradeList } from "../../../components/market/trades";

export async function loader() {
  try {
    const res = await fetch("http://localhost:2700/api/funds", {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },

    });
    if (!res.ok) {
      throw new Error(`Failed to fetch trades (${res.status})`);
    }

    const data = await res.json();
    return { trades: data };
  } catch (err: any) {
    toast.error(err.message || "Something went wrong loading trades");

    throw err;
  }
}

export default function TradesPage() {
  const { trades } = useLoaderData() as { trades: any[] };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Await resolve={trades}>
        {(resolved) => <TradeList trades={resolved} />}
      </Await>
    </Suspense>
  );
}
