pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'
        PEM_PATH = "C:\\Users\\lenovo\\.ssh\\kiosk_key.pem"
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'
        BASH = "C:\\Program Files\\Git\\bin\\bash.exe"
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
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2...'
                bat """
                "${BASH}" -c "scp -i '${PEM_PATH}' be/build/libs/*.jar ec2-user@${EC2_HOST}:/home/ec2-user/app/"
                "${BASH}" -c "scp -i '${PEM_PATH}' -r fe/build/* ec2-user@${EC2_HOST}:/home/ec2-user/app/frontend/"

                // ✅ 백엔드 실행
                "${BASH}" -c "ssh -i '${PEM_PATH}' ec2-user@${EC2_HOST} 'pkill -f kiosk || true'"
                "${BASH}" -c "ssh -i '${PEM_PATH}' ec2-user@${EC2_HOST} 'nohup java -jar /home/ec2-user/app/be-0.0.1-SNAPSHOT.jar > /home/ec2-user/app/app.log 2>&1 &'"

                // ✅ 프론트엔드 실행 (serve 사용)
                "${BASH}" -c "ssh -i '${PEM_PATH}' ec2-user@${EC2_HOST} 'sudo npm install -g serve || true'"
                "${BASH}" -c "ssh -i '${PEM_PATH}' ec2-user@${EC2_HOST} 'pkill -f serve || true'"
                "${BASH}" -c "ssh -i '${PEM_PATH}' ec2-user@${EC2_HOST} 'nohup serve -s /home/ec2-user/app/frontend -l 3000 > /home/ec2-user/app/frontend.log 2>&1 &'"
                """
            }
        }
    }

    post {
        success {
            echo '✅ 백엔드 & 프론트엔드 빌드 및 배포 완료!'
        }
        failure {
            echo '❌ 빌드 실패! 로그를 확인하세요.'
        }
    }
}
