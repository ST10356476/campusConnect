export interface User {
  id: string;
  username: string;
  email: string;
  profile: string;
  communities: string[];
  achievements: string[];
  name: string;        // ✅ added
  badges: string[];    // ✅ added
}
