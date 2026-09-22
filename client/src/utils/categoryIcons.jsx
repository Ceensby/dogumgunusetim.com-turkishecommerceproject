import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CategoryIcon from '@mui/icons-material/Category';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CurtainsIcon from '@mui/icons-material/Curtains';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlagIcon from '@mui/icons-material/Flag';
import CakeIcon from '@mui/icons-material/Cake';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';

const MAP = {
  DinnerDining: DinnerDiningIcon,
  Inventory2: Inventory2Icon,
  TableRestaurant: TableRestaurantIcon,
  Celebration: CelebrationIcon,
  Category: CategoryIcon,
  LocalCafe: LocalCafeIcon,
  ViewWeek: ViewWeekIcon,
  Curtains: CurtainsIcon,
  ContentCut: ContentCutIcon,
  Restaurant: RestaurantIcon,
  Flag: FlagIcon,
  Cake: CakeIcon,
  BubbleChart: BubbleChartIcon,
  DryCleaning: DryCleaningIcon,
};

export function CategoryGroupIcon({ name, ...props }) {
  const Icon = MAP[name] || CategoryIcon;
  return <Icon {...props} />;
}
