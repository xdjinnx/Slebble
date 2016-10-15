#include "departure.h"

#include "../menu/row.h"
#include "pebble.h"

enum DepartureKeyEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TIME_LEFT = 3,
    DEPARTURE_TIME = 4,
    SUBTITLE = 5
};

Departure *departure_create(DictionaryIterator *iter) {
    Departure *departure = calloc(1, sizeof(Departure));

    departure->time_left = dict_find(iter, TIME_LEFT)->value->int8;

    Tuple *depature_time_tuple = dict_find(iter, DEPARTURE_TIME);
    memcpy(departure->departure_time, depature_time_tuple->value->cstring, depature_time_tuple->length);

    Tuple *subtitle_tuple = dict_find(iter, SUBTITLE);
    memcpy(departure->subtitle, subtitle_tuple->value->cstring, subtitle_tuple->length);

    return departure;
}

void departure_destroy(Departure *departure) {
    free(departure);
}

Row *departure_convert(void *data) {
    Departure *departure = data;

    Row *row = row_create();

    if (departure->time_left > 0) {
        snprintf(row->title, 64, "%dmin - %s", departure->time_left, departure->departure_time);
    } else {
        snprintf(row->title, 64, "Nu - %s", departure->departure_time);
    }

    memcpy(row->subtitle, departure->subtitle, 64);

    return row;
}