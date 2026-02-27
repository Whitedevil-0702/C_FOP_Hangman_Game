#include <graphics.h>
#include <conio.h>
#include <stdlib.h>
#include <dos.h>

#define SCREEN_WIDTH 640
#define SCREEN_HEIGHT 480
#define PADDLE_HEIGHT 80
#define PADDLE_WIDTH 10
#define BALL_SIZE 10

int main() {
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "");

    int leftPaddleY = SCREEN_HEIGHT/2 - PADDLE_HEIGHT/2;
    int rightPaddleY = SCREEN_HEIGHT/2 - PADDLE_HEIGHT/2;
    int ballX = SCREEN_WIDTH/2;
    int ballY = SCREEN_HEIGHT/2;
    int ballDirX = 4;
    int ballDirY = 4;

    while(1) {
        cleardevice();

        // Draw middle line
        line(SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2, SCREEN_HEIGHT);

        // Draw paddles
        rectangle(20, leftPaddleY, 20 + PADDLE_WIDTH, leftPaddleY + PADDLE_HEIGHT);
        rectangle(SCREEN_WIDTH - 30, rightPaddleY,
                  SCREEN_WIDTH - 30 + PADDLE_WIDTH,
                  rightPaddleY + PADDLE_HEIGHT);

        // Draw ball
        circle(ballX, ballY, BALL_SIZE);

        // Ball movement
        ballX += ballDirX;
        ballY += ballDirY;

        // Top & bottom collision
        if(ballY <= 0 || ballY >= SCREEN_HEIGHT)
            ballDirY = -ballDirY;

        // Left paddle collision
        if(ballX <= 30 &&
           ballY >= leftPaddleY &&
           ballY <= leftPaddleY + PADDLE_HEIGHT)
            ballDirX = -ballDirX;

        // Right paddle collision
        if(ballX >= SCREEN_WIDTH - 40 &&
           ballY >= rightPaddleY &&
           ballY <= rightPaddleY + PADDLE_HEIGHT)
            ballDirX = -ballDirX;

        // Reset if ball goes out
        if(ballX <= 0 || ballX >= SCREEN_WIDTH) {
            ballX = SCREEN_WIDTH/2;
            ballY = SCREEN_HEIGHT/2;
        }

        // Keyboard controls
        if(kbhit()) {
            char ch = getch();

            if(ch == 27) break;           // ESC to exit
            if(ch == 'w') leftPaddleY -= 20;
            if(ch == 's') leftPaddleY += 20;

            if(ch == 72) rightPaddleY -= 20;  // Up arrow
            if(ch == 80) rightPaddleY += 20;  // Down arrow
        }

        delay(30);
    }

    closegraph();
    return 0;
}