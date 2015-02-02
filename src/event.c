#include "event.h"

enum SLKey {
    PATH_KEY = 0x0,
    INDEX_KEY = 0x1,
    STATION_KEY = 0x2,
    RIDE_KEY = 0x3,
    TO_KEY = 0x4,
    NR_KEY = 0x5,
    MIN_KEY = 0x6,
    ERROR_TITLE_KEY = 0x7,
    ERROR_SUBTITLE_KEY = 0x8,
};

char *event_data_char;
void (*update_ptr)(int, char*, int, char*, char*, int, char*);

void event_set_view_update(void (*update)(int, char*, int, char*, char*, int, char*)) {
    update_ptr = update;
}

void event_set_click_data(char* data) {
    event_data_char = data;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    //APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

void in_received_handler(DictionaryIterator *iter, void *context) {

    //APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");

    Tuple *path_tuple = dict_find(iter, PATH_KEY);
    Tuple *index_tuple = dict_find(iter, INDEX_KEY);
    Tuple *station_tuple = dict_find(iter, STATION_KEY);
    Tuple *ride_tuple = dict_find(iter, RIDE_KEY);
    Tuple *to_tuple = dict_find(iter, TO_KEY);
    Tuple *nr_tuple = dict_find(iter, NR_KEY);
    Tuple *min_tuple = dict_find(iter, MIN_KEY);
    Tuple *error_title_tuple = dict_find(iter, ERROR_TITLE_KEY);
    Tuple *error_subtitle_tuple = dict_find(iter, ERROR_SUBTITLE_KEY);

    int index = index_tuple->value->uint8;
    int size = nr_tuple->value->uint8;

    char title[32];
    char subtitle[32];
    char data_char[32];

    switch(path_tuple->value->uint8) {
        //Receive stations
        case 1:

            memcpy(title, station_tuple->value->cstring, station_tuple->length);
            title[31] = '\0';

            //APP_LOG(APP_LOG_LEVEL_INFO, "Startmenu: number of rows %d of %d", loaded_rows, nr_station_variable);
            update_ptr(size, "Favorites", index, title, "", 0, NULL);
            break;

            //Receive depatures
        case 2:
        
            memcpy(data_char, ride_tuple->value->cstring, ride_tuple->length);

            if(min_tuple->value->uint8 > 0) {
                snprintf(title, 32, "%dmin - %s", min_tuple->value->uint8, data_char);
            } else {
                snprintf(title, 32, "Nu - %s", data_char);
            }
            title[31] = '\0';

            memcpy(subtitle, to_tuple->value->cstring, to_tuple->length);
            subtitle[31] = '\0';

            //APP_LOG(APP_LOG_LEVEL_INFO, "Station: number of rows %d of %d", loaded_rows, nr_ride_variable);
            update_ptr(size, event_data_char, index, title, subtitle, min_tuple->value->uint8, data_char);
            
            break;

            //Receive Error message in depature screen
        case 3:
            memcpy(title, error_title_tuple->value->cstring, error_title_tuple->length);
            title[31] = '\0';

            memcpy(subtitle, error_subtitle_tuple->value->cstring, error_subtitle_tuple->length);
            subtitle[31] = '\0';

            update_ptr(1, "Error", 0, title, subtitle, 0, NULL);

            break;

    }

}


void event_tick_handler(int size, void *data) {
    int *min_left = data;
    for(int i = 0; i < size; i++) {
        if(min_left[i] > 0)
            min_left[i]--;
    }
}

void send_appmessage(int index) {
    Tuplet value = TupletInteger(1, index);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL)
        return;

    dict_write_tuplet(iter, &value);
    dict_write_end(iter);

    app_message_outbox_send();
}