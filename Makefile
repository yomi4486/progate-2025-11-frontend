start-spabase:
	supabase start

gen-types:
	npx supabase gen types typescript --local > ./lib/database.types.ts

native-build:
	npx expo prebuild --platform ios