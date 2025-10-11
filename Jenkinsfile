pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'  // 배포할 EC2 퍼블릭 IP
        PEM_PATH = 'C:\\Users\\lenovo\\Downloads\\kiosk_key.pem' // PEM 키 경로
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git url: "${REPO_URL}", credentialsId: "${REPO_CRED}", branch: 'main'
            }
        }

        stage('Build Backend') {
            steps {
                dir('be') {
                    bat 'gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('fe') {
                    // cross-env CI=false를 package.json에서 이미 설정했으므로 그대로 빌드
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2...'
        bat """
        ssh -i "${PEM_PATH}" -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "mkdir -p /home/ec2-user/app/frontend"
        ssh -i "${PEM_PATH}" -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "sudo chown -R ec2-user:ec2-user /home/ec2-user/app"
        
        scp -i "${PEM_PATH}" -o StrictHostKeyChecking=no be/build/libs/*.jar ec2-user@${EC2_HOST}:/home/ec2-user/app/
        scp -i "${PEM_PATH}" -o StrictHostKeyChecking=no -r fe/build/* ec2-user@${EC2_HOST}:/home/ec2-user/app/frontend/
        """
            }
        }
    }

    post {
        success {
            echo '빌드 & 배포 완료!'
        }
        failure {
            echo '빌드 실패! 로그를 확인하세요.'
        }
    }
}
