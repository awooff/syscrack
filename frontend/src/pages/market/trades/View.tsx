import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";
import toast from "react-hot-toast";
import { LoadingFallback, TradeList } from "../../../components/market/trades";
import { Container } from "react-bootstrap";
import Layout from "../../../components/Layout";

export async function loader() {
  try {
    const res = await fetch("http://localhost:2700/api/funds", {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch funds (${res.status})`);
    }
    const result = await res.json();
    return { funds: result.data };
  } catch (err: any) {
    toast.error(err.message || "Something went wrong loading funds");
    throw err;
  }
}
export default function FundsPage() {
  const { funds } = useLoaderData() as { funds: any[] };

  function mapFund(fund: any) {
    return {
      id: fund.ID ?? fund.id,
      name: fund.Name ?? fund.name,
      description: fund.Description ?? fund.description ?? "No description",
      price: fund.TotalAssets ?? fund.price ?? 0,
      imageUrl: fund.ImageUrl ?? fund.imageUrl ?? "https://placecat.net/300",
    };
  }

  return (
    <Layout>
      <Container className="my-4">
        <Suspense fallback={<LoadingFallback />}>
          <Await resolve={funds}>
            {(resolvedFunds) => {
              const mappedFunds = resolvedFunds.map(mapFund);
              return <TradeList trades={mappedFunds} />;
            }}
          </Await>
        </Suspense>
      </Container>
    </Layout>
  );
}