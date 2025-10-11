pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'  // EC2 퍼블릭 IP
        PEM_PATH = 'C:\\Users\\lenovo\\Downloads\\kiosk_key.pem' // PEM 키 경로
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'                    // Jenkins Credential ID
        DEPLOY_DIR = '~/kiosk'                 // EC2 배포 디렉토리
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
                echo '=== Backend 빌드 ==='
                dir('be') {
                    bat 'gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '=== Frontend 빌드 ==='
                dir('fe') {
                    // Windows bat에서 환경변수 설정 후 npm 빌드
                    bat 'set CI=false && npm install'
                    bat 'set CI=false && npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '=== EC2로 배포 ==='
                // EC2에 디렉토리 생성
                bat """
                ssh -i ${PEM_PATH} -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p ${DEPLOY_DIR}/backend"
                ssh -i ${PEM_PATH} -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p ${DEPLOY_DIR}/frontend"
                """

                // Backend 업로드 및 실행
                bat """
                scp -i ${PEM_PATH} be\\build\\libs\\*.jar ec2-user@${EC2_HOST}:${DEPLOY_DIR}/backend/
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "pkill -f kiosk-backend.jar || true"
                ssh -i ${PEM_PATH} ec2-user@${EC2_HOST} "nohup java -jar ${DEPLOY_DIR}/backend/kiosk-backend.jar > ${DEPLOY_DIR}/backend/nohup.out 2>&1 &"
                """

                // Frontend 업로드
                bat """
                scp -i ${PEM_PATH} -r fe\\build\\* ec2-user@${EC2_HOST}:${DEPLOY_DIR}/frontend/
                """
            }
        }
    }

    post {
        success {
            echo '✅ 배포 완료!'
        }
        failure {
            echo '❌ 배포 실패!'
        }
    }
}
