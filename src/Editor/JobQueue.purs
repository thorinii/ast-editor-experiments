module Editor.JobQueue (
  JobQueue, Job,
  empty, enqueue
) where

import Data.Maybe (Maybe)

type JobQueue = {}
type Job = {}

foreign import empty :: JobQueue
foreign import enqueue :: Job -> JobQueue  -> JobQueue
