/**
 * Centralised email utility using Nodemailer + Gmail.
 *
 * Emails sent:
 *  1. newOrderToAdmin    – admin notified when a customer submits a commission
 *  2. newOrderToCustomer – customer gets confirmation after submitting
 *  3. orderAccepted      – customer notified when admin marks order "in_progress"
 *  4. orderCompleted     – customer notified when admin marks order "completed"
 */

import type { Order } from "@/lib/orderStore";

const ADMIN_EMAIL = "ksunil7077@gmail.com";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function getTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require("nodemailer") as typeof import("nodemailer");
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(124,58,237,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.5px;">✏️ Art From Heart</p>
            <p style="margin:6px 0 0;font-size:14px;color:#ddd6fe;">${title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f3ff;padding:20px;text-align:center;border-top:1px solid #ede9fe;">
            <p style="margin:0;font-size:12px;color:#7c3aed;">Art From Heart · Custom Pencil Sketches</p>
            <p style="margin:4px 0 0;font-size:11px;color:#a78bfa;">Questions? Reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#6d28d9;font-weight:600;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#1c1917;">${value}</td>
  </tr>`;
}

function orderTable(order: Order): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;background:#f5f3ff;border-radius:10px;padding:16px;margin:16px 0;">
    ${row("Order ID", `<code style="background:#ede9fe;padding:2px 6px;border-radius:4px;font-size:12px;">${order.id}</code>`)}
    ${row("Paper Size", order.size)}
    ${row("Subjects", order.subjects)}
    ${row("Complexity", order.complexity.charAt(0).toUpperCase() + order.complexity.slice(1))}
    ${row("Delivery", order.isRush ? `⚡ Rush — ${order.rushDays ?? 3} days` : "Standard")}
    ${row("Est. Price", `<strong style="color:#7c3aed;">₹${order.estimatedPrice.toLocaleString("en-IN")}</strong>`)}
    ${order.notes ? row("Notes", order.notes) : ""}
  </table>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">${text}</a>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

/** 1. Admin — new commission arrived */
export async function newOrderToAdmin(order: Order): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: `"Art From Heart" <${process.env.EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `🆕 New Commission Request — ${order.id}`,
    html: wrap(
      "New Commission Request",
      `<h2 style="margin:0 0 4px;color:#2e1065;font-size:20px;">New order received!</h2>
       <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">A customer has submitted a commission request.</p>

       <table cellpadding="0" cellspacing="0" style="width:100%;background:#f5f3ff;border-radius:10px;padding:16px;margin:0 0 16px;">
         ${row("Customer", `${order.name} &lt;${order.email}&gt;`)}
         ${row("Phone", order.phone || "Not provided")}
         ${order.notes ? row("Notes", order.notes) : ""}
       </table>

       ${orderTable(order)}

       <p style="margin:16px 0 4px;font-size:13px;color:#6b7280;">Reference Image:</p>
       ${btn("View Reference Image →", order.referenceUrl)}

       <p style="margin:24px 0 0;font-size:12px;color:#a78bfa;">
         Log in to the admin panel to accept or manage this order.
       </p>`
    ),
  });
}

/** 2. Customer — commission request received */
export async function newOrderToCustomer(order: Order): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: `"Art From Heart" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `✅ Commission Request Received — ${order.id}`,
    html: wrap(
      "Request Received",
      `<h2 style="margin:0 0 4px;color:#2e1065;font-size:20px;">Thank you, ${order.name}!</h2>
       <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
         We've received your commission request. The artist will review your reference image
         and confirm the final price shortly. Here's a summary of your order:
       </p>

       ${orderTable(order)}

       <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
         We'll notify you by email once your order is accepted and again when your sketch is ready.
         Keep this email for your records.
       </p>`
    ),
  });
}

/** 3. Customer — order accepted (started working) */
export async function orderAcceptedToCustomer(order: Order): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: `"Art From Heart" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `🎨 Your Order Has Been Accepted — ${order.id}`,
    html: wrap(
      "Order Accepted",
      `<h2 style="margin:0 0 4px;color:#2e1065;font-size:20px;">Great news, ${order.name}!</h2>
       <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
         Your commission has been accepted and the artist has started working on your sketch.
         ${order.isRush ? "Your <strong>rush order</strong> will be prioritised." : ""}
       </p>

       ${orderTable(order)}

       <div style="background:#ede9fe;border-left:4px solid #7c3aed;padding:14px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
         <p style="margin:0;font-size:13px;color:#4c1d95;">
           <strong>What's next?</strong> The artist will contact you once the sketch is complete
           to arrange delivery. Estimated time: ${order.isRush ? "7–10 days" : "14–21 days"}.
         </p>
       </div>`
    ),
  });
}

/** 4. Customer — order cancelled */
export async function orderCancelledToCustomer(order: Order): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: `"Art From Heart" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `❌ Order Cancelled — ${order.id}`,
    html: wrap(
      "Order Cancelled",
      `<h2 style="margin:0 0 4px;color:#2e1065;font-size:20px;">Order Cancelled</h2>
       <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
         Hi ${order.name}, unfortunately your commission order has been cancelled.
         If you believe this is a mistake or would like to resubmit, please reach out to us.
       </p>

       ${orderTable(order)}

       <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
         <p style="margin:0;font-size:13px;color:#991b1b;">
           If you have any questions about this cancellation, please reply to this email
           and we'll get back to you as soon as possible.
         </p>
       </div>

       <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
         We're sorry for the inconvenience. You're welcome to submit a new commission request at any time.
       </p>`
    ),
  });
}

/** 5. Customer — order completed */
export async function orderCompletedToCustomer(order: Order): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: `"Art From Heart" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `🖼️ Your Sketch Is Ready — ${order.id}`,
    html: wrap(
      "Order Completed",
      `<h2 style="margin:0 0 4px;color:#2e1065;font-size:20px;">Your sketch is ready, ${order.name}!</h2>
       <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
         We're thrilled to let you know that your custom pencil sketch has been completed.
         The artist will be in touch very soon to arrange delivery of your artwork.
       </p>

       ${orderTable(order)}

       <div style="background:#ede9fe;border-left:4px solid #7c3aed;padding:14px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
         <p style="margin:0;font-size:13px;color:#4c1d95;">
           <strong>Delivery:</strong> The artist will contact you at <strong>${order.email}</strong>
           ${order.phone ? ` or <strong>${order.phone}</strong>` : ""} to coordinate delivery.
           Please keep an eye on your inbox.
         </p>
       </div>

       <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
         Thank you for choosing Art From Heart. We hope you love your sketch! 🎨
       </p>`
    ),
  });
}
