#include "departure.h"

#include "../menu/row.h"
#include "pebble.h"

enum DepartureKeyEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TIME_LEFT = 3,
    DEPARTURE_TIME = 4,
    SUBTITLE = 5
};

typedef struct DepartureData {
    char subtitle[64];

    uint16_t time_left;
    char departure_time[64];
} DepartureData;

void departure_update(Departure *departure) {
    DepartureData *departure_data = departure->data;

    if (departure_data->time_left > 0) {
        snprintf(departure->title, 64, "%dmin - %s", departure_data->time_left, departure_data->departure_time);
    } else {
        snprintf(departure->title, 64, "Nu - %s", departure_data->departure_time);
    }

    memcpy(departure->subtitle, departure_data->subtitle, 64);
}

Departure *departure_create(DictionaryIterator *iter) {
    DepartureData *departure_data = calloc(1, sizeof(DepartureData));

    departure_data->time_left = dict_find(iter, TIME_LEFT)->value->int8;

    Tuple *depature_time_tuple = dict_find(iter, DEPARTURE_TIME);
    memcpy(departure_data->departure_time, depature_time_tuple->value->cstring, depature_time_tuple->length);

    Tuple *subtitle_tuple = dict_find(iter, SUBTITLE);
    memcpy(departure_data->subtitle, subtitle_tuple->value->cstring, subtitle_tuple->length);

    Departure *departure = row_create(departure_data);
    departure_update(departure);

    return departure;
}

void departure_destroy(Departure *departure) {
    free(departure);
}

void departure_decrease_time_left(Departure *departure) {
    DepartureData *departure_data = departure->data;

    if (departure_data->time_left > 0) {
        departure_data->time_left--;
        departure_update(departure);
    }
}

