import { redirect } from "next/navigation";

export default function PartnerSignUpRedirectPage() {
  redirect("/signup?type=partner");
}
