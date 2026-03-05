#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_WORD_LEN 20
#define NUM_WORDS 18
#define MAX_CHANCES 6

const char *words[NUM_WORDS] = {
    "beautiful", "yummy", "hello", "world", "home", "game",
    "music", "operation", "water", "air", "ship", "submarine",
    "nice", "computer", "dog", "cat", "tiger", "lion", "elephant","Lazy", "Quick", "Brown", "Fox","onomatopeia", "supercalifragilisticexpialidocious"
};

char game_word[MAX_WORD_LEN];
char correct_word[MAX_WORD_LEN];
char wrong_letters[MAX_CHANCES];
int game_word_len = 0;
int wrong_count = 0;

void draw_hangman(int wrong) {
    printf("\n");
    switch (wrong) {
        case 0:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("      |\n");
            printf("      |\n");
            printf("      |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 1:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf("      |\n");
            printf("      |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 2:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf("  |   |\n");
            printf("      |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 3:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf(" /|   |\n");
            printf("      |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 4:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf(" /|\\  |\n");
            printf("      |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 5:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf(" /|\\  |\n");
            printf(" /    |\n");
            printf("      |\n");
            printf("=========\n");
            break;
        case 6:
            printf("  +---+\n");
            printf("  |   |\n");
            printf("  O   |\n");
            printf(" /|\\  |\n");
            printf(" / \\  |\n");
            printf("      |\n");
            printf("=========\n");
            break;
    }
    printf("\n");
}

void welcome() {
    char user_name[50];

    printf("|| Welcome to Hangman ||\n");
    printf("Your Name | ");
    fgets(user_name, sizeof(user_name), stdin);
    user_name[strcspn(user_name, "\n")] = '\0';

    printf("\nDirections |\n");
    printf("1 -- Guess the word one letter at a time\n");
    printf("2 -- You have %d chances before the man is hanged\n", MAX_CHANCES);
    printf("3 -- All characters are small case\n");
    printf("4 -- Enter one character at a time\n");
    printf("5 -- No letter is repeated\n");

    printf("\nGood luck %s!\n", user_name);
    printf("Ready\n");
    printf("Set\n");
    printf("Go!\n");
}

void game() {
    char input[10];
    char a;

    while (wrong_count < MAX_CHANCES) {
        draw_hangman(wrong_count);

        // Print wrong letters guessed
        printf("Wrong letters: ");
        for (int i = 0; i < wrong_count; i++) {
            printf("%c ", wrong_letters[i]);
        }
        printf("\n");

        // Print current word state
        printf("Word: %s\n\n", correct_word);
        printf("Chances left: %d\n", MAX_CHANCES - wrong_count);

        printf("Your character: ");
        fgets(input, sizeof(input), stdin);
        input[strcspn(input, "\n")] = '\0';

        if (strlen(input) != 1) {
            printf("Wrong input! Enter only one character.\n");
            continue;
        }

        a = input[0];

        // Check if already guessed
        if (strchr(correct_word, a) != NULL || strchr(wrong_letters, a) != NULL) {
            printf("You already guessed '%c'! Try a different letter.\n", a);
            continue;
        }

        if (strchr(game_word, a) != NULL) {
            // Fill in all occurrences of the letter
            for (int i = 0; i < game_word_len; i++) {
                if (game_word[i] == a) {
                    correct_word[i] = a;
                }
            }
            printf("'%c' is in the word!\n", a);

            // Check win
            if (strcmp(correct_word, game_word) == 0) {
                draw_hangman(wrong_count);
                printf("Word: %s\n", correct_word);
                printf("\nYou won! The word was: %s\n", game_word);
                return;
            }
        } else {
            wrong_letters[wrong_count] = a;
            wrong_count++;
            printf("'%c' is not in the word!\n", a);
        }
    }

    // Lost
    draw_hangman(wrong_count);
    printf("\nYou lost! The word was: %s\n", game_word);
}

int main() {
    srand(time(NULL));

    int index = rand() % NUM_WORDS;
    strcpy(game_word, words[index]);
    game_word_len = strlen(game_word);

    // Initialize correct_word with underscores
    for (int i = 0; i < game_word_len; i++) {
        correct_word[i] = '_';
    }
    correct_word[game_word_len] = '\0';

    welcome();
    game();

    return 0;
}