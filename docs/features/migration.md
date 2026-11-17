# Moving recipes into Table

Table has a guided migration screen at **Settings → Bring recipes over**.

From the existing installation, create the built-in recipe export archive and
download the complete `.zip` file. Upload that ZIP to Table without extracting
it. The migration preserves recipe details, ingredients, instructions, tags,
nutrition information, source URLs, and recipe images.

By default, recipes with matching names are skipped. The migration screen also
offers an explicit duplicate-import option when copies are desired. User
accounts, passwords, deployment settings, and some historical planning data are
not part of the recipe archive; those require a separate database/media backup
or a future dedicated migration.
