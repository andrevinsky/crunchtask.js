/**
 * Created by andrew on 4/23/16.
 */
import type from '../utils/type';

export const resolvedTask = () => {
  const TaskType = type.getTaskType();
  return new TaskType((init, body) => body(resolve => resolve()));
};
