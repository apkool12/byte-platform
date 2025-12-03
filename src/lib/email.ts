import nodemailer from "nodemailer";

// SMTP 설정을 환경 변수에서 가져오기
const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
};

// 이메일 전송기 생성
const createTransporter = () => {
  // SMTP 설정이 없으면 null 반환 (이메일 전송 기능 비활성화)
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn("SMTP 설정이 없어 이메일 전송 기능이 비활성화되었습니다.");
    console.warn("SMTP_USER:", smtpConfig.auth.user ? "설정됨" : "설정 안됨");
    console.warn(
      "SMTP_PASSWORD:",
      smtpConfig.auth.pass ? "설정됨" : "설정 안됨"
    );
    return null;
  }

  console.log("SMTP 전송기 생성 중...");
  console.log("SMTP_HOST:", smtpConfig.host);
  console.log("SMTP_PORT:", smtpConfig.port);
  console.log("SMTP_SECURE:", smtpConfig.secure);
  // 보안을 위해 이메일 주소는 마스킹하여 출력
  const maskedEmail = smtpConfig.auth.user
    ? smtpConfig.auth.user.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "설정 안됨";
  console.log("SMTP_USER:", maskedEmail);

  return nodemailer.createTransport(smtpConfig);
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 이메일 전송 함수
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log("이메일 전송 시도:", options.to);
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("이메일 전송기 생성 실패: SMTP 설정이 없습니다.");
      return false;
    }

    const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
    const fromName = process.env.SMTP_FROM_NAME || "Byte";

    console.log("이메일 전송 정보:");
    console.log("  FROM:", `"${fromName}" <${fromEmail}>`);
    console.log("  TO:", options.to);
    console.log("  SUBJECT:", options.subject);

    const result = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // HTML 태그 제거하여 텍스트 생성
    });

    console.log("이메일 전송 성공:", options.to);
    console.log("전송 결과:", result.messageId);
    return true;
  } catch (error: any) {
    console.error("이메일 전송 실패:", error);
    console.error("에러 상세:", error.message);
    if (error.code) {
      console.error("에러 코드:", error.code);
    }
    if (error.response) {
      console.error("에러 응답:", error.response);
    }
    return false;
  }
}

/**
 * 게시글 알림 이메일 전송 (멘션 또는 부서 게시글)
 */
export async function sendPostNotificationEmail(
  toEmail: string,
  toName: string,
  postAuthor: string,
  postTitle: string,
  postContent: string,
  postId: number,
  type: "mention" | "department",
  department?: string,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
): Promise<boolean> {
  const postUrl = `${siteUrl}/posts/${postId}`;

  const badgeText =
    type === "mention"
      ? "@멘션"
      : `부서 게시글${department ? ` (${department})` : ""}`;
  const badgeColor = type === "mention" ? "#e3f2fd" : "#f3e5f5";
  const badgeTextColor = type === "mention" ? "#1976d2" : "#7b1fa2";

  const notificationMessage =
    type === "mention"
      ? `<strong>${postAuthor}</strong>님이 게시글에서 당신을 언급했습니다.`
      : `<strong>${postAuthor}</strong>님이 ${
          department ? `${department} 부서` : "귀하의 부서"
        } 게시글을 작성했습니다.`;

  const subject =
    type === "mention"
      ? `[Byte] ${postAuthor}님이 게시글에서 당신을 언급했습니다`
      : `[Byte] ${postAuthor}님이 ${
          department ? `${department} 부서` : "새로운"
        } 게시글을 작성했습니다`;

  // HTML 이메일 템플릿
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          border-bottom: 2px solid #1d1d1f;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1d1d1f;
        }
        .content {
          margin-bottom: 24px;
        }
        .badge {
          display: inline-block;
          background-color: ${badgeColor};
          color: ${badgeTextColor};
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .post-title {
          font-size: 20px;
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: 12px;
        }
        .post-author {
          color: #86868b;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .post-content {
          background-color: #f5f5f7;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          color: #1d1d1f;
        }
        .button {
          display: inline-block;
          background-color: #1d1d1f;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 16px;
        }
        .footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e5ea;
          color: #86868b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Byte</div>
        </div>
        <div class="content">
          <div class="badge">${badgeText}</div>
          <p>안녕하세요, <strong>${toName}</strong>님!</p>
          <p>${notificationMessage}</p>
          
          <div class="post-title">${postTitle}</div>
          <div class="post-author">작성자: ${postAuthor}</div>
          
          <div class="post-content">
            ${postContent.substring(0, 200)}${
    postContent.length > 200 ? "..." : ""
  }
          </div>
          
          <a href="${postUrl}" class="button">게시글 보기</a>
        </div>
        <div class="footer">
          <p>이 이메일은 Byte 플랫폼에서 자동으로 전송되었습니다.</p>
          <p>${siteUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textMessage =
    type === "mention"
      ? `${toName}님, ${postAuthor}님이 게시글 "${postTitle}"에서 당신을 언급했습니다. 게시글 보기: ${postUrl}`
      : `${toName}님, ${postAuthor}님이 ${
          department ? `${department} 부서` : "새로운"
        } 게시글 "${postTitle}"을 작성했습니다. 게시글 보기: ${postUrl}`;

  return await sendEmail({
    to: toEmail,
    subject,
    html,
    text: textMessage,
  });
}

/**
 * 멘션 알림 이메일 전송 (하위 호환성 유지)
 */
export async function sendMentionEmail(
  toEmail: string,
  toName: string,
  postAuthor: string,
  postTitle: string,
  postContent: string,
  postId: number,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
): Promise<boolean> {
  return sendPostNotificationEmail(
    toEmail,
    toName,
    postAuthor,
    postTitle,
    postContent,
    postId,
    "mention",
    undefined,
    siteUrl
  );
}
