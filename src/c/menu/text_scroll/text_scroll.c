#include "text_scroll.h"

AppTimer *scroll_timer;
int text_scroll = -2;

uint text_scroll_value() {
    if (text_scroll < 0) {
        return 0;
    }

    return (uint)text_scroll;
}

void text_scroll_reset() {
    text_scroll = -2;
}

void text_scroll_handler(void *data) {
    Menu *menu = (Menu *)data;
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);

    Row *row = NULL;

    if (menu->size > 0) {
        row = menu->converter(menu->data[selected_item.row]);
    }

    if (row) {
        char current_char = *(row->title + ((uint)text_scroll * sizeof(char)));

        // Fixes åäö edge case
        if (current_char == 195) {
            text_scroll++;
        }
    }

    if (selected_item.section != 0) {
        text_scroll++;
    }

    if (row && text_scroll > ((int)strlen(row->title)) - 17) {
        text_scroll = -2;
    }

    menu_layer_reload_data(menu->layer);
    scroll_timer = app_timer_register(500, &text_scroll_handler, data);
    row_destroy(row);
}

void menu_init_text_scroll(Menu *menu) {
    scroll_timer = app_timer_register(500, &text_scroll_handler, menu);
}
void menu_deinit_text_scroll() {
    app_timer_cancel(scroll_timer);
}
