# 바이브코딩 리액트게시판  
React와 TypeScript를 사용하여 개발된 게시판 애플리케이션입니다. 데이터는 DB 대신 로컬 파일 시스템에 저장되며, Docker를 통해 어디서든 동일한 환경으로 배포 가능합니다.

프로젝트 소개
이 프로젝트는 기본적인 게시판 기능을 제공하는 웹 애플리케이션입니다. react-router-dom을 사용하여 SPA 라우팅을 구현하였으며, 데이터 영속성을 위해 JSON 파일 기반의 CRUD를 수행합니다.
파일은 최대1M까지로하고, 초과시 새로운파일을 생성합니다.
## 데이터 관리 지침 (File System Optimization)

본 프로젝트는 대용량 데이터 환경에서도 빠른 조회 속도를 유지하기 위해 다음과 같은 파일 관리 전략을 준수한다.

### 1. 인덱스 파일 시스템 (`index.json`) 도입
- **목적**: 데이터 파일이 늘어나도 전체 목록 조회 속도를 일정하게 유지한다.
- **구조**: `index.json` 파일은 모든 게시글의 메타데이터만 포함하는 경량 데이터베이스 역할을 한다.
- **필수 필드**: `id`, `title`, `createdAt`, `author`, `fileName` (본문 내용이 포함된 파일명)
- **워크플로우**:
  - **목록 조회**: 본문이 포함된 데이터 파일을 열지 않고 `index.json`만 읽어서 화면에 리스트를 렌더링한다.
  - **상세 조회**: `index.json`에서 해당 글의 `fileName`을 찾은 뒤, 그 파일만 열어 본문(content)을 가져온다.

### 2. 데이터 샤딩 및 파일 명명 규칙
- **파일 크기 제한**: 개별 데이터 파일(`.json`)은 1MB를 초과하지 않도록 관리한다.
- **네이밍 컨벤션**: 파일명에 날짜와 순번을 포함하여 물리적 정렬이 가능하게 한다.
  - 예: `posts_20251225_1.json`, `posts_20251225_2.json`
- **최신순 정렬 이점**: 
  - 파일명을 기준으로 역순 정렬하면 최근에 생성된 파일을 우선적으로 탐색할 수 있어 인덱스 갱신 및 조회 시 효율적이다.

### 3. CRUD 작업 시 주의사항
- **쓰기(Create)**: 새 글 작성 시 현재 활성화된(마지막) 데이터 파일의 크기를 체크한다. 1MB 초과 시 위 명명 규칙에 따라 새 파일을 생성하고 `index.json`을 업데이트한다.
- **삭제(Delete)**: 데이터 파일에서 본문을 삭제한 후, `index.json`에서도 해당 항목을 반드시 제거하여 데이터 일관성을 유지한다.
삭제는 쓴 사람만 할수있게 ,비밀번호를 관리한다. 
코드수정시 data파일은 삭제하지 않는다.
내가쓴글은 본인만 수정할수있어야되. 물론 비번을 확인하고 수정해야지.

주요 기능
게시글 목록 (/): 등록된 모든 게시글을 리스트 형태로 확인할 수 있습니다.

게시글 작성 (/create): 새로운 게시글을 작성하여 등록할 수 있습니다.

게시글 상세 (/post/:id): 리스트에서 선택한 게시글의 상세 내용을 볼 수 있습니다.

파일 기반 CRUD: 게시글 데이터는 서버 측의 posts.json 파일에 저장 및 관리됩니다.

404 페이지: 존재하지 않는 경로로 접근 시 안내 메시지를 표시합니다.

기술 스택
Frontend: React, TypeScript, React Router DOM

Backend (Storage): Node.js (File System API)

Deployment: Docker, Render

파일 기반 CRUD 지침
데이터 저장소: 프로젝트 루트의 /data/posts.json 파일을 데이터베이스로 활용합니다.

읽기/쓰기: Node.js의 fs 모듈을 사용하여 데이터를 처리하며, 동시성 문제를 방지하기 위해 fs.promises 또는 동기 방식을 적절히 조합합니다.

Docker 배포 설정
프로젝트를 Docker 이미지로 빌드하고 실행하려면 아래 과정을 따르세요.
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
# 이미지 빌드
docker build -t vibe-board .

# 컨테이너 실행 (데이터 유지를 위해 볼륨 마운트 권장)
docker run -p 3000:3000 -v $(pwd)/data:/app/data vibe-board