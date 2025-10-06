export function useAuth() {
  return {
    accessToken: undefined as string | undefined,
    isInitialLoading: false,
  };
}
