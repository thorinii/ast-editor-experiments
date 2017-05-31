module UI.Selectors (
  StatusLine(..), StatusLevel(..),
  status, levelEq, levelId
) where

import Data.StrMap as StrMap
import Editor.JobQueue as JobQueue
import Editor.State as State
import Data.Array (foldl, null)
import Data.Generic (class Generic, gEq)
import Data.Maybe (maybe)
import Data.Monoid (class Monoid)
import Data.Semigroup (class Semigroup, (<>))
import Data.StrMap (StrMap)
import Data.String (joinWith)
import Data.Tuple (Tuple(..))
import Editor.JobQueue (JobQueue)
import Editor.State (State)
import Prelude (class Eq, map, not, ($), (>>>))

data StatusLevel = StatusInfo | StatusWarn | StatusError

derive instance genericStatusLevel :: Generic StatusLevel
instance eqStatusLevel :: Eq StatusLevel where
  eq = gEq
instance semigroupStatusLevel :: Semigroup StatusLevel where
  append StatusError _ = StatusError
  append _ StatusError = StatusError
  append StatusWarn _ = StatusWarn
  append _ StatusWarn = StatusWarn
  append _ _ = StatusInfo
instance monoidStatusLevel :: Monoid StatusLevel where
  mempty = StatusInfo

levelEq :: StatusLevel -> StatusLevel -> Boolean
levelEq = gEq

levelId :: StatusLevel -> String
levelId StatusInfo = "info"
levelId StatusWarn = "warn"
levelId StatusError = "error"


newtype StatusLine = StatusLine {
  level :: StatusLevel,
  message :: String
}


status :: State -> StatusLine
status state = StatusLine { level: level, message: message }
  where failed = (State.cache >>> failedCompiles) state <>
                 (State.cache >>> failedTests) state
        message = joinWith "\n" $ map (\(Tuple _ m) -> m) messages
        level = foldl (<>) StatusInfo $ map (\(Tuple l _) -> l) messages
        messages = [Tuple StatusInfo "Idle" ] <> failed


-- jobsMessage :: JobQueue -> String
-- jobsMessage queue =
--   let { running, waiting } = jobs queue
--       runningS = if null waiting then ["Idle"] else [joinWith ", " running]
--       waitingS = if null waiting then [] else ["(" <> joinWith ", " waiting <> ")"]
--       combined = runningS <> waitingS
--   in joinWith " " combined
--
-- jobs :: JobQueue -> { running :: Array String, waiting :: Array String }
-- jobs queue = { running: running, waiting: waiting }
--   where running = (JobQueue.allRunning >>> map (\j -> j.type)) queue
--         waiting = (JobQueue.allQueued >>> map (\j -> j.type)) queue

failedCompiles :: StrMap (StrMap State.JobResult) -> Array (Tuple StatusLevel String)
failedCompiles cache = maybe [] f $ StrMap.lookup "compiled" cache
  where f compiles = StrMap.foldMap
          (\key (State.JobResult value) ->
            if not value.success
              then [Tuple StatusWarn $ "Failed to compile " <> key]
              else [])
          compiles

failedTests :: StrMap (StrMap State.JobResult) -> Array (Tuple StatusLevel String)
failedTests cache = maybe [] f $ StrMap.lookup "tested" cache
  where f compiles = StrMap.foldMap
          (\key (State.JobResult value) ->
            if not value.success
              then [Tuple StatusWarn $ "Failed to test " <> key]
              else [])
          compiles
