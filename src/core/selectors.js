import Selectors from '../UI/Selectors'

module.exports = {
  status: state => {
    const { level, message } = Selectors.status(state)
    return { level: Selectors.levelId(level), message }
  }
}
