import ProfilePageClient from "./ProfilePageClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My Profile — TerraServe Challenges",
  description: "Manage your TerraServe Challenges profile.",
  path: "/dashboard/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
