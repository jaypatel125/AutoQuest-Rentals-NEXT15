export default async function ConfirmatoinPage() {
  // const sessionId = Array.isArray(searchParams.session_id)
  //   ? searchParams.session_id[0]
  //   : searchParams.session_id;

  // if (!sessionId) {
  //   throw new Error("Please provide a valid session_id (`cs_test_...`)");
  // }

  // const session = await stripe.checkout.sessions.retrieve(sessionId, {
  //   expand: ["line_items", "payment_intent"],
  // });

  // const { status, customer_details } = session;

  // if (status === "open") {
  //   return redirect("/");
  // }

  // if (status === "complete") {
  //   return (
  //     <section id="success">
  //       <p>
  //         We appreciate your business! A confirmation email will be sent to....
  //         If you have any questions, please email{" "}
  //       </p>
  //       <a href="mailto:orders@example.com">orders@example.com</a>.
  //     </section>
  //   );
  // }

  return (
    <p>
      We appreciate your business! A confirmation email will be sent to.....
    </p>
  );
}
