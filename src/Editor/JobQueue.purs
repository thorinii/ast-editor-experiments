module Editor.JobQueue (
  JobQueue, Job,
  empty,
  isEmpty, isIdle,
  allQueued, allRunning,
  enqueue, dequeue,
  start, finish
) where

import Data.Array as Array
import Data.StrMap as StrMap
import Data.Maybe (Maybe(..), maybe)
import Data.StrMap (StrMap)
import Data.Tuple (Tuple(..))
import Prelude (id, not, ($), (<$>))

type Job = { type :: String }

-- TODO: abstract over job (make a type variable with Eq)
data JobQueue = JobQueue (Array Job) (StrMap Job)

empty :: JobQueue
empty = JobQueue [] StrMap.empty

isEmpty :: JobQueue -> Boolean
isEmpty (JobQueue queued _) = Array.null queued

isIdle :: JobQueue -> Boolean
isIdle (JobQueue _ running) = StrMap.isEmpty running

allQueued :: JobQueue -> Array Job
allQueued (JobQueue queued _) = queued

allRunning :: JobQueue -> Array Job
allRunning (JobQueue _ running) = StrMap.values running


enqueue :: Job -> JobQueue -> JobQueue
enqueue job (JobQueue queued running) = JobQueue (queued `Array.snoc` job) running -- TODO: isSameJob

dequeue :: JobQueue -> Tuple JobQueue (Maybe Job)
dequeue jq | not (isIdle jq) = Tuple jq Nothing
dequeue jq@(JobQueue queued running) =
  let job = Array.head queued
      tail = Array.tail queued
      nextM = (\tail' -> Tuple (JobQueue tail' running) job) <$> tail
  in maybe (Tuple jq Nothing) id nextM


start :: String -> Job -> JobQueue -> JobQueue
start id job (JobQueue queued running) = JobQueue queued $ StrMap.insert id job running

finish :: String -> JobQueue -> Tuple JobQueue (Maybe Job)
finish id jq@(JobQueue queued running) =
  let job = StrMap.lookup id running
      running' = StrMap.delete id running
      nextM = (\_ -> Tuple (JobQueue queued running') job) <$> job
  in maybe (Tuple jq Nothing) (\x -> x) nextM
