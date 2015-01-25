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

void (*update_ptr)(int, char*, int, char*, char*);

void event_set_view_update(void (*update)(int, char*, int, char*, char*)) {
    update_ptr = update;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    //APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

/*
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

    switch(path_tuple->value->uint8) {
        //Receive stations
        case 1:

            temp = malloc(sizeof(struct node));

            memcpy(temp->title, station_tuple->value->cstring, station_tuple->length);
            temp->title[31] = '\0';
            temp->index = index_tuple->value->uint8;
            root_startmenu = linkedlist_push(root_startmenu, temp);

            nr_station_variable = nr_tuple->value->uint8;

            loaded_rows++;

            //APP_LOG(APP_LOG_LEVEL_INFO, "Startmenu: number of rows %d of %d", loaded_rows, nr_station_variable);
            if(loaded_rows == nr_station_variable) {
                root_startmenu = linkedlist_sort(root_startmenu);
                remove_startscreen();
            }
            break;
            //Receive depatures
        case 2:
            memcpy(stationmenu_title[index_tuple->value->uint8], ride_tuple->value->cstring, ride_tuple->length);
            stationmenu_title[index_tuple->value->uint8][31] = '\0';

            memcpy(stationmenu_subtitle[index_tuple->value->uint8], to_tuple->value->cstring, to_tuple->length);
            stationmenu_subtitle[index_tuple->value->uint8][31] = '\0';

            stationmenu_minLeft[index_tuple->value->uint8] = min_tuple->value->uint8;

            nr_ride_variable = nr_tuple->value->uint8;

            loaded_rows++;

            //APP_LOG(APP_LOG_LEVEL_INFO, "Station: number of rows %d of %d", loaded_rows, nr_ride_variable);
            if(loaded_rows == nr_ride_variable)
                remove_loadscreen();
            break;
            //Receive Error message in depature screen
        case 3:
            memcpy(stationmenu_title[0], error_title_tuple->value->cstring, error_title_tuple->length);
            stationmenu_title[0][31] = '\0';

            memcpy(stationmenu_subtitle[0], error_subtitle_tuple->value->cstring, error_subtitle_tuple->length);
            stationmenu_subtitle[0][31] = '\0';

            stationmenu_minLeft[0] = -1;
            nr_ride_variable = 1;

            remove_loadscreen();

            break;
    }

}
*/

void event_tick_handler(void *data) {

}