#include "menu.h"

int updates = 0;
int new_id = 0;
AppTimer *scroll_timer;
int text_scroll = -2;
uint prev_index = 0;


uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    Menu* menu = data;
    if(menu->id == 0)
        return 2;
    else
        return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    Menu *menu = data;
    if (menu->id == 0 && section_index == 0)
        return 1;
    else
        return menu->size;
}

int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    // This is a define provided in pebble.h that you may use for the default height
    return MENU_CELL_BASIC_HEADER_HEIGHT;
}

void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
    Menu* menu = data;
    if(menu->id == 0 && section_index == 0)
        menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
    else
        menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
}

void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    Menu* menu = data;
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);
    if(menu->id == 0 && cell_index->section == 0)
        menu_cell_basic_draw(ctx, cell_layer, "Nearby Stations", "", NULL);
    else {
        if(selected_item.row == cell_index->row && text_scroll >= 0)
            menu_cell_basic_draw(ctx, cell_layer, menu->row_title[cell_index->row]+((uint)text_scroll*sizeof(char)), menu->row_subtitle[cell_index->row], NULL);
        else 
            menu_cell_basic_draw(ctx, cell_layer, menu->row_title[cell_index->row], menu->row_subtitle[cell_index->row], NULL);
    }
}

void text_scroll_handler(void *data) {
    Menu* menu = *((Menu**)data);
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);

    if(menu->size > 0) {
        char current_char = *(menu->row_title[selected_item.row]+((uint)text_scroll*sizeof(char)));
        //Fixes åäö edge case
        if(current_char == 195)
            text_scroll++;
    }
    
    if(!(menu->id == 0 && selected_item.section == 0))
        text_scroll++;
    
    if(menu->size > 0 && text_scroll > ((int)strlen(menu->row_title[selected_item.row])) - 17)
        text_scroll = -2;

    if(menu->id == 0 && selected_item.section == 0)
        text_scroll = -2;

    if(selected_item.row != prev_index) {
        prev_index = selected_item.row;
        text_scroll = -2;
    }

    menu_layer_reload_data(menu->layer);
    scroll_timer = app_timer_register(500, &text_scroll_handler, data);
    
}

bool load_persistent(Menu *menu) {
    if(menu->id == 0 && persist_exists(0) && persist_read_int(0) > 0) {
        int size = persist_read_int(0);
        
        menu->title = malloc(sizeof(char)*32);
        menu->row_title = malloc(sizeof(char*)*size);
        menu->row_subtitle = malloc(sizeof(char*)*size);
        menu->data_char = malloc(sizeof(char*)*size);
        for(int i = 0; i < size; i++) {
            menu->row_title[i] = malloc(sizeof(char)*32);
            menu->row_subtitle[i] = malloc(sizeof(char)*32);
            menu->data_char[i] = malloc(sizeof(char)*32);
        }
        menu->data_int = malloc(sizeof(int)*size);


        for(int i = 1; persist_exists(i); i++) {
            persist_read_string(i, menu->row_title[i-1], 32);
            snprintf(menu->title, 32, "%s", "Favorites");
            snprintf(menu->row_subtitle[i-1], 32, "%s", "");
            menu->size = size;
        } 

        return true;
    } 
    return false;
}

void store_persistent(Menu *menu) {
    persist_write_int(0, menu->size);
    for(int i = 0; i < menu->size; i++)
        persist_write_string(i+1, menu->row_title[i]);
}

void window_load(Window *window) {
    updates = 0;

    Menu* menu = window_get_user_data(window);

    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_frame(window_layer);

    menu->layer = menu_layer_create(bounds);

    menu_layer_set_callbacks(menu->layer, menu, (MenuLayerCallbacks){
            .get_num_sections = menu_get_num_sections_callback,
            .get_num_rows = menu_get_num_rows_callback,
            .get_header_height = menu_get_header_height_callback,
            .draw_header = menu_draw_header_callback,
            .draw_row = menu_draw_row_callback,
            .select_click = menu->callbacks.select_click,
    });

    menu->load_image = gbitmap_create_with_resource(menu->load_image_resource_id);
    menu->load_layer = bitmap_layer_create(bounds);
    bitmap_layer_set_background_color(menu->load_layer, GColorWhite);
    bitmap_layer_set_bitmap(menu->load_layer, menu->load_image);

    layer_add_child(window_layer, menu_layer_get_layer(menu->layer));
    layer_add_child(window_layer, bitmap_layer_get_layer(menu->load_layer));

}

void window_unload(Window *window) {
    Menu* menu = window_get_user_data(window);

    Menu *ret = menu->menu;

    if(ret != NULL)
        prev_index = menu_layer_get_selected_index(ret->layer).row;
    text_scroll = -2;

    menu->callbacks.remove_callback(ret);

    window_stack_remove(window, true);
    window_destroy(window);
    menu_layer_destroy(menu->layer);
    bitmap_layer_destroy(menu->load_layer);
    gbitmap_destroy(menu->load_image);

    if(menu->size != 0) {
        for(int i = 0; i < menu->size; i++) {
            free(menu->row_title[i]);
            free(menu->row_subtitle[i]);
            free(menu->data_char[i]);
        }
        free(menu->row_title);
        free(menu->row_subtitle);
        free(menu->title);
        free(menu->data_int);
        free(menu->data_char);
    }

    free(menu);
}

void hide_load_image(Menu *menu, bool vibe) {
    if(!layer_get_hidden(bitmap_layer_get_layer(menu->load_layer))) {
        prev_index = 0;
        text_scroll = -2;
        menu_layer_reload_data(menu->layer);
        layer_set_hidden(bitmap_layer_get_layer(menu->load_layer), true);
        menu_layer_set_click_config_onto_window(menu->layer, menu->window);
        if(vibe)
            vibes_short_pulse();
    }
}

void menu_update(void *menu_void, int incoming_id, int size, char *title, int index, char *row_title, char *row_subtitle, int data_int, char *data_char) {
    if(menu_void == NULL)
        return;

    Menu *menu = (Menu*)menu_void;

    if(menu->id == incoming_id) {

        if(menu->size == 0) {
            menu->title = malloc(sizeof(char)*32);
            menu->row_title = malloc(sizeof(char*)*size);
            menu->row_subtitle = malloc(sizeof(char*)*size);
            menu->data_char = malloc(sizeof(char*)*size);
            for(int i = 0; i < size; i++) {
                menu->row_title[i] = malloc(sizeof(char)*32);
                menu->row_subtitle[i] = malloc(sizeof(char)*32);
                menu->data_char[i] = malloc(sizeof(char)*32);
            }
            menu->data_int = malloc(sizeof(int)*size);
        }

        if(menu->size != size && menu->size != 0) {
            if(menu->size > size) {
                for(int i = size; i < menu->size; i++) {
                    free(menu->row_title[i]);
                    free(menu->row_subtitle[i]);
                    free(menu->data_char[i]);
                }
            }
            
            menu->row_title = realloc(menu->row_title, sizeof(char*)*size);
            menu->row_subtitle = realloc(menu->row_subtitle, sizeof(char*)*size);
            menu->data_char = realloc(menu->data_char, sizeof(char*)*size);

            if(menu->size < size) {
                for(int i = menu->size; i < size; i++) {
                    menu->row_title[i] = malloc(sizeof(char)*32);
                    menu->row_subtitle[i] = malloc(sizeof(char)*32);
                    menu->data_char[i] = malloc(sizeof(char)*32);
                }
            }

            menu->data_int = realloc(menu->data_int, sizeof(int)*size);
        }

        menu->size = size;
        memcpy(menu->title, title, 32);
        memcpy(menu->row_title[index], row_title, 32);
        memcpy(menu->row_subtitle[index], row_subtitle, 32);
        
        if(data_char != NULL)
            memcpy(menu->data_char[index], data_char, 32);

        int *temp = menu->data_int;
        temp[index] = data_int;


        updates++;
        if(updates >= size) {
            updates = 0;
            menu_layer_reload_data(menu->layer);
            hide_load_image(menu, true);
            if(menu->id == 0)
                store_persistent(menu);
        }

    }
}

void menu_init_text_scroll(Menu **menu) {
    scroll_timer = app_timer_register(500, &text_scroll_handler, menu);
}
void menu_deinit_text_scroll() {
    app_timer_cancel(scroll_timer);
}

Menu* menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks) {
    Menu* menu = malloc(sizeof(Menu));
    menu->window = window_create();
    menu->load_image_resource_id = load_image_resource_id;
    menu->callbacks = callbacks;
    menu->size = 0;
    menu->id = new_id++;

    bool loaded_persistant = load_persistent(menu);

    window_set_user_data(menu->window, menu);

    window_set_window_handlers(menu->window, (WindowHandlers) {
            .load = window_load,
            .unload = window_unload,
    });

    window_stack_push(menu->window, true);
    if(loaded_persistant)
        hide_load_image(menu, false);    

    return menu;
}