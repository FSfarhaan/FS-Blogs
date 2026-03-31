import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

type PublishedPostEmail = {
  title: string;
  description: string;
  slug: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

function buildPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, `${siteConfig.url}/`).toString();
}

function buildPostEmailHtml(post: PublishedPostEmail) {
  const postUrl = buildPostUrl(post.slug);

  return `
    <div style="font-family: Arial, sans-serif; background:#f6efe8; padding:32px;">
      <div style="max-width:600px; margin:0 auto; background:#fffdf9; border-radius:24px; padding:32px; border:1px solid #eadfd1;">
        <p style="margin:0 0 12px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8b6f53;">
          ${siteConfig.shortName}
        </p>
        <h1 style="margin:0 0 16px; font-size:30px; line-height:1.2; color:#1d1a17;">
          ${post.title}
        </h1>
        <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#55483b;">
          ${post.description}
        </p>
        <a
          href="${postUrl}"
          style="display:inline-block; padding:12px 20px; border-radius:999px; background:#eb6f3d; color:#fff; text-decoration:none; font-weight:700;"
        >
          Read the article
        </a>
        <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#7b6c5d;">
          You are receiving this because you subscribed to updates from ${siteConfig.name}.
        </p>
      </div>
    </div>
  `;
}

export async function sendPublishedPostEmail(options: {
  recipients: string[];
  post: PublishedPostEmail;
}) {
  const { recipients, post } = options;

  if (!recipients.length) {
    return { sent: 0 };
  }

  const resend = getResendClient();
  const subject = `New post: ${post.title}`;
  const html = buildPostEmailHtml(post);

  await Promise.all(
    recipients.map((recipient) =>
      resend.emails.send({
        from: getFromAddress(),
        to: recipient,
        subject,
        html,
      }),
    ),
  );

  return { sent: recipients.length };
}
