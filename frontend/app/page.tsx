import dynamic from "next/dynamic";

const MissionControl = dynamic(
  () => import("@/components/layout/MissionControl").then((m) => ({ default: m.MissionControl })),
  { ssr: false, loading: () => null }
);

export default function Home() {
  return <MissionControl />;
}
