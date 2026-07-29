import { redirect } from "next/navigation";

/** Landing → the guesthouse visitor form (which shares the public sidebar). */
export default function Home() {
  redirect("/visitor");
}
