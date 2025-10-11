pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'
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
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 using Jenkins Credentials...'

                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-deploy-key', keyFileVariable: 'EC2_KEY')]) {
                    // Backend JAR 배포
                    bat """
                    scp -i "%EC2_KEY%" be\\build\\libs\\*.jar ec2-user@${EC2_HOST}:/home/ec2-user/app/
                    """

                    // Frontend build 배포
                    bat """
                    scp -i "%EC2_KEY%" -r fe\\build\\* ec2-user@${EC2_HOST}:/home/ec2-user/app/frontend/
                    """

                    // 필요 시 EC2 서비스 재시작
                    bat """
                    ssh -i "%EC2_KEY%" ec2-user@${EC2_HOST} "sudo systemctl restart kiosk-app.service"
                    """
                }
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
