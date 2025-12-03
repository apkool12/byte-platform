import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmails() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        approved: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('\n=== 등록된 사용자 이메일 목록 ===\n');
    console.log(`총 ${users.length}명의 사용자가 등록되어 있습니다.\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   이메일: ${user.email || '(이메일 없음)'}`);
      console.log(`   부서: ${user.department || '(부서 없음)'}`);
      console.log(`   승인 상태: ${user.approved ? '승인됨' : '대기중'}`);
      console.log('');
    });

    const usersWithEmail = users.filter(u => u.email);
    const usersWithoutEmail = users.filter(u => !u.email);

    console.log('\n=== 요약 ===');
    console.log(`이메일 있는 사용자: ${usersWithEmail.length}명`);
    console.log(`이메일 없는 사용자: ${usersWithoutEmail.length}명`);

    if (usersWithoutEmail.length > 0) {
      console.log('\n이메일이 없는 사용자:');
      usersWithoutEmail.forEach(u => {
        console.log(`  - ${u.name} (ID: ${u.id})`);
      });
    }
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmails();

