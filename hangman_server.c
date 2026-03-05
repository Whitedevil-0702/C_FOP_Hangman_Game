#define MG_ENABLE_FILE 0

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "mongoose.h"

#define MAX_WORD_LEN 20
#define NUM_WORDS    18
#define MAX_CHANCES  6

const char *words[NUM_WORDS] = {
    "beautiful", "yummy", "hello", "world", "home", "game",
    "music", "operation", "water", "air", "ship", "submarine",
    "nice", "computer", "dog", "cat", "tiger", "lion",
};

static char game_word[MAX_WORD_LEN];
static char correct_word[MAX_WORD_LEN];
static char wrong_letters[MAX_CHANCES + 1];
static int  game_word_len = 0;
static int  wrong_count   = 0;
static int  game_active   = 0;

#define CORS \
    "Access-Control-Allow-Origin: *\r\n" \
    "Access-Control-Allow-Methods: GET, POST\r\n" \
    "Access-Control-Allow-Headers: Content-Type\r\n"

static void handle_new_game(struct mg_connection *c) {
    srand((unsigned int)time(NULL));
    int index = rand() % NUM_WORDS;

    strcpy(game_word, words[index]);
    game_word_len = (int)strlen(game_word);

    for (int i = 0; i < game_word_len; i++) correct_word[i] = '_';
    correct_word[game_word_len] = '\0';

    memset(wrong_letters, 0, sizeof(wrong_letters));
    wrong_count = 0;
    game_active = 1;

    char json[64];
    sprintf(json, "{\"length\":%d}", game_word_len);
    mg_http_reply(c, 200, "Content-Type: application/json\r\n" CORS, "%s", json);
}

static void handle_guess(struct mg_connection *c, struct mg_str body) {
    if (!game_active) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n" CORS,
                      "{\"error\":\"no active game\"}");
        return;
    }

    char letter[4] = {0};
    sscanf(body.buf, "{\"letter\":\"%1[^\"]\"}", letter);

    if (!letter[0] || letter[0] < 'a' || letter[0] > 'z') {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n" CORS,
                      "{\"error\":\"invalid letter\"}");
        return;
    }

    char ch = letter[0];
    int  hit = 0;

    for (int i = 0; i < game_word_len; i++) {
        if (game_word[i] == ch) {
            correct_word[i] = ch;
            hit = 1;
        }
    }

    char json[256];

    if (hit) {
        int won = (strcmp(correct_word, game_word) == 0);
        if (won) game_active = 0;
        sprintf(json,
            "{\"hit\":true,\"word\":\"%s\",\"won\":%s}",
            correct_word, won ? "true" : "false");
    } else {
        wrong_letters[wrong_count++] = ch;
        wrong_letters[wrong_count]   = '\0';
        int lost = (wrong_count >= MAX_CHANCES);
        if (lost) game_active = 0;
        sprintf(json,
            "{\"hit\":false,\"wrong_count\":%d,\"wrong_letters\":\"%s\",\"lost\":%s,\"answer\":\"%s\"}",
            wrong_count, wrong_letters,
            lost ? "true" : "false",
            lost ? game_word : "");
    }

    mg_http_reply(c, 200, "Content-Type: application/json\r\n" CORS, "%s", json);
}

static void event_handler(struct mg_connection *c, int ev, void *ev_data) {
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *) ev_data;

        if (mg_match(hm->method, mg_str("OPTIONS"), NULL)) {
            mg_http_reply(c, 204, CORS, "");
        } else if (mg_match(hm->uri, mg_str("/new"), NULL)) {
            handle_new_game(c);
        } else if (mg_match(hm->uri, mg_str("/guess"), NULL)) {
            handle_guess(c, hm->body);
        } else {
            mg_http_reply(c, 404, "", "Not found");
        }
    }
}

int main(void) {
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);
    mg_http_listen(&mgr, "http://0.0.0.0:8080", event_handler, NULL);

    printf("========================================\n");
    printf("  Hangman server running!\n");
    printf("  Open hangman.html directly in browser\n");
    printf("  Press Ctrl+C to stop.\n");
    printf("========================================\n");

    for (;;) mg_mgr_poll(&mgr, 100);

    mg_mgr_free(&mgr);
    return 0;
}
