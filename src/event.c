#include "event.h"

enum SLKey {
    PATH_KEY = 0x0,
    LAST_KEY = 0x1,
    STATION_KEY = 0x2,
    RIDE_KEY = 0x3,
    TO_KEY = 0x4,
    MIN_KEY = 0x6,
    ERROR_TITLE_KEY = 0x7,
    ERROR_SUBTITLE_KEY = 0x8,
    PACKAGE_KEY = 0x9
};

int queue_size = 0;
Event_Row queue[20];
int expected_package_key = 0;
char *event_data_char = "Favorites";
view_func add_view;
void **view_ptr;

void event_set_view_func(void *view, view_func func) {
    view_ptr = view;
    add_view = func;
}

void event_set_click_data(char* data) {
    event_data_char = data;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    //APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

void in_received_handler(DictionaryIterator *iter, void *context) {

    //APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");

    Tuple *package_tuple = dict_find(iter, PACKAGE_KEY);
    Tuple *path_tuple = dict_find(iter, PATH_KEY);
    Tuple *last_tuple = dict_find(iter, LAST_KEY);
    Tuple *station_tuple = dict_find(iter, STATION_KEY);
    Tuple *ride_tuple = dict_find(iter, RIDE_KEY);
    Tuple *to_tuple = dict_find(iter, TO_KEY);
    Tuple *min_tuple = dict_find(iter, MIN_KEY);
    Tuple *error_title_tuple = dict_find(iter, ERROR_TITLE_KEY);
    Tuple *error_subtitle_tuple = dict_find(iter, ERROR_SUBTITLE_KEY);

    if(package_tuple->value->uint8 >= expected_package_key) {
        switch(path_tuple->value->uint8) {
            //Receive stations
            case 1:

                memcpy(queue[queue_size].title, station_tuple->value->cstring, station_tuple->length);
                char *temp = "";
                memcpy(queue[queue_size].subtitle, temp, 32);
                queue[queue_size].data_int = 0;
                queue_size++;

                //APP_LOG(APP_LOG_LEVEL_INFO, "Startmenu: number of rows %d of %d", loaded_rows, nr_station_variable);
                break;

            //Receive depatures
            case 2:

                memcpy(queue[queue_size].data_char, ride_tuple->value->cstring, ride_tuple->length);

                if(min_tuple->value->uint8 > 0) {
                    snprintf(queue[queue_size].title, 32, "%dmin - %s", min_tuple->value->uint8, queue[queue_size].data_char);
                } else {
                    snprintf(queue[queue_size].title, 32, "Nu - %s", queue[queue_size].data_char);
                }

                memcpy(queue[queue_size].subtitle, to_tuple->value->cstring, to_tuple->length);
                queue[queue_size].data_int = min_tuple->value->uint8;

                queue_size++;

                //APP_LOG(APP_LOG_LEVEL_INFO, "Station: number of rows %d of %d", loaded_rows, nr_ride_variable);
                break;

                //Receive Error message in depature screen
            case 3:
                memcpy(queue[queue_size].title, error_title_tuple->value->cstring, error_title_tuple->length);
                memcpy(queue[queue_size].subtitle, error_subtitle_tuple->value->cstring, error_subtitle_tuple->length);
                queue[queue_size].data_int = 0;
                event_data_char = "Error";

                queue_size++;
                tick_timer_service_unsubscribe();
                break;
        }

        if(last_tuple->value->int8) {
            add_view(*view_ptr, event_data_char, queue, queue_size);
            queue_size = 0;
        }

    }
}

void event_register_app_message() {
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
  app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
}

void event_tick_handler(int size, void *data) {
    int *min_left = data;
    for(int i = 0; i < size; i++) {
        if(min_left[i] > 0)
            min_left[i]--;
    }
}

void appmessage(int index, int step) {
    queue_size = 0;
    Tuplet value1 = TupletInteger(1, index);
    Tuplet value2 = TupletInteger(2, step);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL)
        return;

    dict_write_tuplet(iter, &value1);
    dict_write_tuplet(iter, &value2);
    dict_write_end(iter);

    app_message_outbox_send();
}

void update_appmessage() {
    appmessage(0, 2);
}

void send_appmessage(int index, int step) {
    expected_package_key++;
    appmessage(index, step);
}
