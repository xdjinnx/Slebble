#pragma once

#include "../menu.h"

extern uint text_scroll_value();
extern void text_scroll_reset();

extern void menu_init_text_scroll(Menu *menu);
extern void menu_deinit_text_scroll();
