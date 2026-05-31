import ProfilePageClient from "./ProfilePageClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My Profile — HourQuest",
  description: "Manage your HourQuest profile.",
  path: "/dashboard/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
