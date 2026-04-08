import { getPostBySlug } from "@/lib/blog-store";
import { sendPublishedPostEmail } from "@/lib/email";
import { getSubscriberEmails } from "@/lib/firebase";
import { isAdminAuthenticated } from "@/lib/admin-auth-server";
import { setPostEmailSent } from "@/lib/admin-posts";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return Response.json({ error: "Post not found." }, { status: 404 });
    }

    const recipients = await getSubscriberEmails();

    const result = await sendPublishedPostEmail({
      recipients,
      post: {
        title: post.title,
        description: post.description,
        slug: post.slug,
      },
    });

    const allDelivered = result.total > 0 && result.failed === 0;
    await setPostEmailSent(post.slug, allDelivered);

    console.log("Itne logo ko gaya email " + result.sent);

    return Response.json({
      message: allDelivered
        ? `Email sent to all ${result.sent} subscribers.`
        : `Email sent to ${result.sent} of ${result.total} subscribers. ${result.failed} failed.`,
      delivered: result.sent,
      failed: result.failed,
      total: result.total,
      failures: result.failures,
      emailSent: allDelivered,
    });
  } catch (error) {
    console.error("Admin send notification error", error);

    return Response.json(
      { error: "Unable to send post notifications right now." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const emailSent = body.emailSent === true;

    await setPostEmailSent(slug, emailSent);

    return Response.json({
      message: `Email status updated to ${emailSent}.`,
      emailSent,
    });
  } catch (error) {
    console.error("Admin update notification status error", error);

    return Response.json(
      { error: "Unable to update email status right now." },
      { status: 500 },
    );
  }
}
