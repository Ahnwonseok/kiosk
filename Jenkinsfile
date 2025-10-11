pipeline {
    agent any

    environment {
        // EC2 정보
        EC2_HOST = "ec2-xx-xxx-xxx-xx.ap-northeast-2.compute.amazonaws.com"

        // 백엔드
        BACKEND_DIR = "/home/ec2-user/backend"
        BACKEND_APP_NAME = "kiosk-backend"
        BACKEND_BUILD_DIR = "backend/build/libs"
        BACKEND_JAR = "${BACKEND_BUILD_DIR}/${BACKEND_APP_NAME}.jar"

        // 프론트엔드
        FRONTEND_DIR = "/home/ec2-user/frontend"
        FRONTEND_BUILD_DIR = "frontend/build"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "=== GitHub에서 소스 코드 가져오기 ==="
                git branch: 'main', url: 'https://github.com/Ahnwonseok/kiosk.git'
            }
        }

        stage('Build Backend') {
            steps {
                echo "=== 백엔드 빌드 중 ==="
                dir('backend') {
                    sh './gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo "=== 프론트엔드 빌드 중 ==="
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "=== EC2로 배포 시작 ==="
                sshagent(['ec2-deploy-key']) {
                    sh '''
                        # ----------------------
                        # 1️⃣ 백엔드 배포
                        # ----------------------
                        ssh -o StrictHostKeyChecking=no ec2-user@$EC2_HOST "mkdir -p $BACKEND_DIR"
                        scp -o StrictHostKeyChecking=no $BACKEND_JAR ec2-user@$EC2_HOST:$BACKEND_DIR/

                        # 기존 백엔드 종료
                        ssh ec2-user@$EC2_HOST "pkill -f '${BACKEND_APP_NAME}.jar' || true"

                        # 새 백엔드 실행
                        ssh ec2-user@$EC2_HOST "nohup java -jar $BACKEND_DIR/${BACKEND_APP_NAME}.jar > $BACKEND_DIR/nohup.out 2>&1 &"

                        # ----------------------
                        # 2️⃣ 프론트엔드 배포
                        # ----------------------
                        ssh -o StrictHostKeyChecking=no ec2-user@$EC2_HOST "mkdir -p $FRONTEND_DIR"
                        scp -r frontend/build/* ec2-user@$EC2_HOST:$FRONTEND_DIR/

                        # Nginx root에 복사
                        ssh ec2-user@$EC2_HOST "sudo rm -rf /usr/share/nginx/html/*"
                        ssh ec2-user@$EC2_HOST "sudo cp -r $FRONTEND_DIR/* /usr/share/nginx/html/"
                        ssh ec2-user@$EC2_HOST "sudo systemctl restart nginx"
                    '''
                }
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
