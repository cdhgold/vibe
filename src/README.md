# 바이브코딩 리액트게시판 (MongoDB 기반)
React와 TypeScript를 사용하여 개발된 게시판 애플리케이션입니다. 데이터 영속성을 위해 MongoDB Atlas 클라우드 데이터베이스를 사용하며, Docker를 통해 일관된 환경으로 배포됩니다.

프로젝트 소개
이 프로젝트는 기본적인 게시판 기능을 제공하는 웹 애플리케이션입니다. react-router-dom을 사용하여 SPA 라우팅을 구현하였으며, 클라우드 DB 연동을 통해 안정적인 CRUD 기능을 수행합니다.

주요 기능
게시글 목록 (/): MongoDB에 저장된 모든 게시글을 최신순으로 조회합니다.

게시글 작성 (/create): 제목, 작성자, 본문, 비밀번호를 입력하여 새 글을 등록합니다.

게시글 상세 (/post/:id): 선택한 게시글의 상세 내용을 확인할 수 있습니다.

보안 CRUD: 게시글 수정 및 삭제 시 비밀번호 확인 절차를 거쳐 본인 여부를 검증합니다.

404 페이지: 존재하지 않는 경로 접근 시 안내 메시지를 표시합니다.

기술 스택
Frontend: React, TypeScript, React Router DOM

Backend: Node.js, Express, Mongoose (MongoDB ODM)

Database: MongoDB Atlas (Cloud)

Deployment: Docker, Render

데이터 관리 및 보안 지침
1. MongoDB Atlas 연동
환경 변수: 보안을 위해 DB 주소는 소스 코드에 직접 노출하지 않고 MONGODB_URI 환경 변수를 사용한다.
mongodb+srv://cdhgold:chleogus007@CDH@cluster0.wexpmse.mongodb.net/?appName=Cluster0

데이터 모델: 모든 게시글은 title, content, author, password, createdAt 필드를 포함하는 스키마를 따른다.

2. CRUD 보안 규칙
수정/삭제: 요청 시 사용자가 입력한 비밀번호와 DB에 저장된 비밀번호를 서버 측에서 비교한 후 일치할 경우에만 작업을 수행한다.

데이터 보존: 코드나 Docker 이미지가 수정되어도 클라우드 DB에 저장된 데이터는 삭제되지 않고 영구적으로 보존된다.

Docker 배포 설정
프로젝트를 Docker 이미지로 빌드하고 실행하려면 아래 과정을 따르세요.
# 1단계: 빌드 (Node.js)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 실행 (최종 이미지)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./
RUN npm install --only=production

EXPOSE 3000
# 환경 변수 MONGODB_URI는 배포 시 외부(Render 등)에서 주입받음
CMD ["node", "src/server.js"]
# 이미지 빌드
docker build -t vibe-board .

# 컨테이너 실행 (환경 변수 주입 필요)
docker run -p 3000:3000 -e MONGODB_URI='당신의_몽고DB_주소' vibe-board