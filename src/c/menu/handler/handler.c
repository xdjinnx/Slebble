#include "handler.h"

#include "../menu.h"
#include "../text_scroll/text_scroll.h"

uint16_t get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    Menu *menu = data;

    if (menu->menu == NULL) {
        return 2;
    }

    return 1;
}

uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    Menu *menu = data;

    if (menu->menu == NULL && section_index == 0) {
        return 1;
    }

    return menu->size;
}

int16_t get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    // This is a define provided in pebble.h that you may use for the default height
    return MENU_CELL_BASIC_HEADER_HEIGHT;
}

void draw_header_callback(GContext *ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
    Menu *menu = data;

    if (menu->menu == NULL && section_index == 0) {
        menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
    } else {
        menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
    }
}

void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    Menu *menu = data;

    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);
    if (menu->menu == NULL && cell_index->section == 0)
        menu_cell_basic_draw(ctx, cell_layer, "Nearby Stations", "", NULL);
    else {
        Row *row = menu->row[cell_index->row];
        char *title = row->title;
        char *subtitle = row->subtitle;

        if (selected_item.row == cell_index->row && menu->menu == NULL) {
            title = title + (text_scroll_value() * sizeof(char));
        }

        menu_cell_basic_draw(ctx, cell_layer, title, subtitle, NULL);
    }
}

void selection_will_change_callback(struct MenuLayer *menu_layer, MenuIndex *new_index, MenuIndex old_index, void *data) {
    text_scroll_reset();
}
