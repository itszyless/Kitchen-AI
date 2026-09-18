import { Image } from "expo-image";
import { useTheme } from "@/theme/useTheme";
import home from "../../assets/images/icons/ui/_0001_home.png";
import homeFilled from "../../assets/images/icons/ui/home_filled.png";
import recipes from "../../assets/images/icons/ui/_0003_discover.png";
import recipesFilled from "../../assets/images/icons/ui/_0002_discover_filled.png";
import profile from "../../assets/images/icons/ui/_0005_profile.png";
import profileFilled from "../../assets/images/icons/ui/_0004_profile_filled.png";
import pantry from "../../assets/images/icons/ui/_0007_pantry.png";
import pantryFilled from "../../assets/images/icons/ui/_0006_pantry_filled.png";
import settings from "../../assets/images/icons/ui/settings.png";
import edit from "../../assets/images/icons/ui/edit.png";
import verified from "../../assets/images/icons/ui/verified.png";
import plus from "../../assets/images/icons/ui/plus.png";
import visible from "../../assets/images/icons/ui/eye_visible.png";
import invisible from "../../assets/images/icons/ui/eye_invisible.png";
import notificationsOn from "../../assets/images/icons/ui/notifications_on.png";
import notificationsOff from "../../assets/images/icons/ui/notifications_off.png";
const icons = {
  home,
  recipes,
  profile,
  pantry,
  settings,
  edit,
  verified,
  plus,
  visible,
  invisible,
  notificationsOn,
  notificationsOff,
};
const filledIcons = {
  home: homeFilled,
  recipes: recipesFilled,
  profile: profileFilled,
  pantry: pantryFilled,
};
export type AppIconName = keyof typeof icons;
export function AppIcon({
  name,
  filled = false,
  size = 24,
  color,
}: {
  name: AppIconName;
  filled?: boolean;
  size?: number;
  color?: string;
}) {
  const c = useTheme();
  return (
    <Image
      source={
        filled && name in filledIcons
          ? filledIcons[name as keyof typeof filledIcons]
          : icons[name]
      }
      tintColor={
        name === "plus" && !c.dark && !color ? undefined : (color ?? c.text)
      }
      contentFit="contain"
      style={{ width: size, height: size }}
      accessible={false}
    />
  );
}
