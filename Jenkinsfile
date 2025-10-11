pipeline {
    agent any

    environment {
        // EC2 정보
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'  // EC2 퍼블릭 IP
        PEM_PATH = 'C:/Users/lenovo/Downloads/kiosk_key.pem'     // PEM 키 경로 (Windows)
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'                                     // Jenkins Credential ID
        DEPLOY_DIR = '/home/ec2-user/kiosk'                     // EC2 절대 경로
        BACKEND_NAME = 'kiosk-backend.jar'
        BACKEND_DIR = "${DEPLOY_DIR}/backend"
        FRONTEND_DIR = "${DEPLOY_DIR}/frontend"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                echo '=== GitHub에서 코드 체크아웃 ==='
                git url: "${REPO_URL}", credentialsId: "${REPO_CRED}", branch: 'main'
            }
        }

        stage('Build Backend') {
            steps {
                echo '=== 백엔드 빌드 ==='
                dir('be') {
                    bat 'gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '=== 프론트엔드 빌드 ==='
                dir('fe') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('EC2 Init Setup') {
            steps {
                echo '=== EC2 초기 설정 실행 (Nginx 설치 등) ==='
                bat """
                ssh -i ${PEM_PATH} -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "bash -s" < deploy/init-deploy.sh
                """
            }
        }

        stage('Deploy Backend & Frontend') {
            steps {
                echo '=== EC2로 배포 시작 ==='

                // 1️⃣ EC2 디렉토리 생성
                bat """
                ssh -i ${PEM_PATH} -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p ${BACKEND_DIR} ${FRONTEND_DIR}"
                """

                // 2️⃣ 백엔드 업로드 + 실행
                bat """
                scp -i ${PEM_PATH} be\\build\\libs\\*.jar ec2-user@${EC2_HOST}:${BACKEND_DIR}/
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "pkill -f ${BACKEND_NAME} || true"
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "nohup java -jar ${BACKEND_DIR}/${BACKEND_NAME} > ${BACKEND_DIR}/nohup.out 2>&1 &"
                """

                // 3️⃣ 프론트엔드 업로드
                bat """
                scp -i ${PEM_PATH} -r fe\\build\\* ec2-user@${EC2_HOST}:${FRONTEND_DIR}/
                """

                // 4️⃣ Nginx root 덮어쓰기 + 재시작
                bat """
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "sudo rm -rf /usr/share/nginx/html/*"
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "sudo cp -r ${FRONTEND_DIR}/* /usr/share/nginx/html/"
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "sudo systemctl restart nginx"
                """
            }
        }
    }

    post {
        success {
            echo '✅ 백엔드 + 프론트엔드 EC2 배포 완료!'
        }
        failure {
            echo '❌ 배포 실패! Jenkins 로그 확인 필요.'
        }
    }
}
