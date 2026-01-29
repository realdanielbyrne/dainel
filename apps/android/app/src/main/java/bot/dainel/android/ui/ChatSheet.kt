package bot.dainel.android.ui

import androidx.compose.runtime.Composable
import bot.dainel.android.MainViewModel
import bot.dainel.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
