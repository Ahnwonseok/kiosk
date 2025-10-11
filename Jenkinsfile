pipeline {
    agent any

    environment {
        EC2_HOST = "ec2-52-91-215-61.compute-1.amazonaws.com"

        BACKEND_DIR = "/home/ec2-user/backend"
        BACKEND_APP_NAME = "kiosk-backend"
        BACKEND_JAR = "${BACKEND_DIR}/${BACKEND_APP_NAME}.jar"

        FRONTEND_DIR = "/home/ec2-user/frontend"
        NGINX_ROOT = "/usr/share/nginx/html"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "=== GitHub에서 소스 코드 가져오기 ==="
                git branch: 'main', url: 'https://github.com/Ahnwonseok/kiosk.git'
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "=== EC2 배포 시작 (Windows Jenkins 전용) ==="
                sshagent(['ec2-deploy-key']) {
                    // 백엔드 빌드 + 배포
                    bat """
                    ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p ${BACKEND_DIR}"
                    scp -o StrictHostKeyChecking=no backend/build/libs/${BACKEND_APP_NAME}.jar ec2-user@${EC2_HOST}:${BACKEND_DIR}/
                    ssh ec2-user@${EC2_HOST} "pkill -f ${BACKEND_APP_NAME}.jar || true"
                    ssh ec2-user@${EC2_HOST} "nohup java -jar ${BACKEND_JAR} > ${BACKEND_DIR}/nohup.out 2>&1 &"
                    """

                    // 프론트엔드 빌드 + 배포
                    bat """
                    ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p ${FRONTEND_DIR}"
                    scp -r frontend/build/* ec2-user@${EC2_HOST}:${FRONTEND_DIR}/
                    ssh ec2-user@${EC2_HOST} "sudo rm -rf ${NGINX_ROOT}/*"
                    ssh ec2-user@${EC2_HOST} "sudo cp -r ${FRONTEND_DIR}/* ${NGINX_ROOT}/"
                    ssh ec2-user@${EC2_HOST} "sudo systemctl restart nginx"
                    """
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
