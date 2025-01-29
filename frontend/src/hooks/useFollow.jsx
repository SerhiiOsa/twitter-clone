import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useFollow = () => {
  const queruClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await fetch('/api/users/follow/' + userId, {
          method: 'POST',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        return;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      Promise.all([
        queruClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
        queruClient.invalidateQueries({ queryKey: ['authUser'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};

export default useFollow;
