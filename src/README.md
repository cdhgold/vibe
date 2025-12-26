# 바이브코딩 리액트게시판 (Lightweight File-based)
React와 TypeScript를 사용하여 개발된 경량 게시판 애플리케이션입니다. 데이터 영속성을 위해 별도의 DB 설치 없이 서버 로컬의 JSON 파일을 사용하며, Docker를 통해 네이버 클라우드 마이크로 서버 등 저사양 환경에서도 일관된 배포가 가능합니다.

프로젝트 소개
이 프로젝트는 복잡한 데이터베이스 연결 설정 없이 즉시 실행 가능한 웹 애플리케이션입니다. react-router-dom을 사용하여 SPA 라우팅을 구현하였으며, 서버 실행 시 데이터 저장용 폴더와 파일을 자동으로 생성하여 관리합니다.

주요 기능
게시글 목록 (/): 서버 내 posts.json 파일에 저장된 모든 게시글을 최신순으로 조회합니다.

게시글 작성 (/create): 제목, 작성자, 본문, 비밀번호를 입력하여 JSON 파일에 새 데이터를 기록합니다.

게시글 상세 (/post/:id): 파일 내 특정 ID를 가진 게시글의 상세 내용을 확인합니다.

보안 CRUD: 수정 및 삭제 시 저장된 비밀번호와 입력값을 비교하여 본인 여부를 검증합니다.

자동 환경 구성: 서버 시작 시 /data 폴더와 posts.json 파일이 없으면 자동으로 생성합니다.

기술 스택
Frontend: React, TypeScript, React Router DOM

Backend: Node.js, Express, fs-extra (File System API)

Database: Local File System (JSON)

Deployment: Docker, Naver Cloud Platform (VPC/Micro Server), Render

데이터 관리 및 보안 지침
1. 파일 기반 데이터 연동
자동 초기화 (index.js): 서버 구동 시 data/ 디렉토리와 posts.json 존재 여부를 확인하고, 없을 경우 빈 배열([])로 파일을 생성합니다.

데이터 모델: 모든 게시글은 id, title, content, author, password, createdAt 필드를 포함하는 스키마를 따릅니다.

2. CRUD 보안 규칙
수정/삭제: 요청 시 사용자가 입력한 비밀번호와 JSON 파일 내 저장된 비밀번호를 서버 측에서 비교한 후 일치할 경우에만 작업을 수행합니다.

데이터 보존: Docker 배포 시 호스트 서버의 디렉토리를 컨테이너 내부와 연결(Volume Mount)하여 컨테이너가 재시작되어도 데이터가 삭제되지 않도록 보호합니다.
#GITHUB주소
https://github.com/cdhgold/vibe.git

Docker 배포 설정
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
# 데이터 저장을 위한 디렉토리 생성
RUN mkdir -p /app/data
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./
RUN npm install --only=production

EXPOSE 3000
# 파일 기반 서버 실행
CMD ["node", "src/server.js"]
#이미지 빌드 및 실행 명령어
# 1. 이미지 빌드
docker build -t vibe-board .

# 2. 컨테이너 실행 (데이터 보존을 위한 볼륨 마운트 적용)
# 네이버 클라우드 서버의 /root/data 폴더를 컨테이너와 연결합니다.
docker run -d -p 3000:3000 \
  -v /root/data:/app/data \
  --name vibe-app \
  vibe-board