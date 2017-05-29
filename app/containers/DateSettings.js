import React, { Component } from 'react';
import {
  DatePickerIOS,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppEventsLogger } from 'react-native-fbsdk';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons';

import moment from 'moment-timezone';

import * as dateRangeActions from '../actions/dateRange';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  datePicker: {
    backgroundColor: 'white',
  },
});

const rangeOptions = {
  DAY: [{
    id: 0,
    name: 'Today',
    startDate: new Date(moment().subtract(1, 'days')),
    endDate: new Date(moment()),
  }, {
    id: 1,
    name: 'Yesterday',
    startDate: new Date(moment().subtract(2, 'days')),
    endDate: new Date(moment().subtract(1, 'days')),
  }],
  WEEK: [{
    id: 0,
    name: 'Last 7 days',
    startDate: new Date(moment().subtract(7, 'days')),
    endDate: new Date(moment().subtract(1, 'days')),
  }, {
    id: 1,
    name: 'This week',
    startDate: new Date(moment().startOf('week')),
    endDate: new Date(moment().endOf('week')),
  }, {
    id: 2,
    name: 'Last week',
    startDate: new Date(moment().startOf('week').subtract(7, 'days')),
    endDate: new Date(moment().endOf('week').subtract(7, 'days')),
  }],
  MONTH: [{
    id: 0,
    name: 'Last 30 days',
    startDate: new Date(moment().subtract(30, 'days')),
    endDate: new Date(moment().subtract(1, 'days')),
    display: `${moment().subtract(30, 'days').format('DD MMMM')} - ${moment().subtract(1, 'days').format('DD MMMM')}`,
  }, {
    id: 1,
    name: 'This month',
    startDate: new Date(moment().startOf('month')),
    endDate: new Date(moment().endOf('month')),
    display: moment().startOf('month').format('MMMM'),
  }, {
    id: 2,
    name: 'Last month',
    startDate: new Date(moment().subtract(1, 'months').startOf('month')),
    endDate: new Date(moment().subtract(1, 'months').endOf('month')),
    display: moment().startOf('month').subtract(1, 'months').format('MMMM'),
  }],
};

class DateSettingsView extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Date Settings',
    headerLeft: <TouchableOpacity
      underlayColor="white"
      onPress={() => {
        navigation.goBack();
        AppEventsLogger.logEvent('press-close-button');
      }}
    >
      <Icon name="clear" size={30} color="#0076FF" />
    </TouchableOpacity>,
    headerRight: <TouchableOpacity
      underlayColor="white"
      onPress={() => {
        const { index, checkDay, checkWeek, checkMonth } = navigation.state.params;
        const { setRangeType, setStartDate, setEndDate } = navigation.state.params;

        if (index === 0) {
          setRangeType('days');
          setStartDate(rangeOptions.DAY[checkDay].startDate);
          setEndDate(rangeOptions.DAY[checkDay].endDate);
        } else if (index === 1) {
          setRangeType('weeks');
          setStartDate(rangeOptions.WEEK[checkWeek].startDate);
          setEndDate(rangeOptions.WEEK[checkWeek].endDate);
        } else if (index === 2) {
          setRangeType('months');
          setStartDate(rangeOptions.MONTH[checkMonth].startDate);
          setEndDate(rangeOptions.MONTH[checkMonth].endDate);
        } else if (index === 3) {
          setRangeType('custom');
        }

        // setStartDate(startDate);
        // setEndDate(endDate);

        navigation.goBack();
        AppEventsLogger.logEvent('press-save-date-range-button');
      }}
    >
      <Text style={{ marginRight: 6, fontSize: 16, color: '#0076FF' }}>Save</Text>
    </TouchableOpacity>,
    headerStyle: {
      backgroundColor: 'white',
    },
  })

  state = {
    index: 0,
    routes: [
      { key: 'DAY', title: 'DAY' },
      { key: 'WEEK', title: 'WEEK' },
      { key: 'MONTH', title: 'MONTH' },
      { key: 'CUSTOM', title: 'CUSTOM' },
    ],
    startDate: new Date(moment()),
    endDate: new Date(moment().subtract(1, 'days')),
    checkDay: 0,
    checkWeek: 0,
    checkMonth: 0,
    checkCustom: 0,
    isStartDatePickerShow: false,
    isEndDatePickerShow: false,
  };

  componentDidMount() {
    this.props.navigation.setParams({
      index: this.state.index,
      setRangeType: this.props.setRangeType,
      setStartDate: this.props.setStartDate,
      setEndDate: this.props.setEndDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      checkDay: this.state.checkDay,
      checkWeek: this.state.checkWeek,
      checkMonth: this.state.checkMonth,
      checkCustom: this.state.checkCustom,
    });
  }

  handleChangeTab = (index) => {
    this.setState({ index });
    this.props.navigation.setParams({ index });
  };

  showDatePickerAndroid = async (date, startOrEnd = 'START') => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({ date });
      if (action !== DatePickerAndroid.dismissedAction) {
        const date = new Date(Date.UTC(year, month, day, 8));
        if (startOrEnd === 'START') {
          this.setState({
            startDate: date,
            isChanged: true,
          });
          AppEventsLogger.logEvent('change-start-date', 0, { startDate: date.toString() });
        } else {
          this.setState({
            endDate: date,
            isChanged: true,
          });
          AppEventsLogger.logEvent('change-end-date', 0, { endDate: date.toString() });
        }
      }
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  }

  openStartDatePicker() {
    const { startDate } = this.props;

    if (Platform.OS === 'ios') {
      this.setState({
        isStartDatePickerShow: !this.state.isStartDatePickerShow,
        isEndDatePickerShow: false,
      });
    } else {
      this.showDatePickerAndroid(startDate, 'START');
    }
    AppEventsLogger.logEvent('press-change-start-date');
  }

  openEndDatePicker() {
    const { endDate } = this.props;

    if (Platform.OS === 'ios') {
      this.setState({
        isEndDatePickerShow: !this.state.isEndDatePickerShow,
        isStartDatePickerShow: false,
      });
    } else {
      this.showDatePickerAndroid(endDate, 'END');
    }
    AppEventsLogger.logEvent('press-change-end-date');
  }

  renderHeader = props => <TabBar {...props} labelStyle={{ fontSize: 10 }} />;

  renderScene = ({ route }) => {
    const { startDate, endDate, setStartDate, setEndDate } = this.props;

    const that = this;
    switch (route.key) {
      case 'DAY':
        return (<View style={styles.container}>
          {rangeOptions.DAY.map(option => (<TouchableOpacity
            key={option.id}
            onPress={() => {
              that.props.navigation.setParams({
                checkDay: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });

              that.setState({
                checkDay: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });
            }}
          >
            <View style={styles.row}>
              <View>
                <Text>{option.name}</Text>
                <Text style={styles.dateText}>{moment(option.endDate).format('dddd, DD MMMM')}</Text>
              </View>
              {that.state.checkDay === option.id && <Icon name="check" size={20} color="#0076FF" />}
            </View>
          </TouchableOpacity>))}
        </View>);

      case 'WEEK':
        return (<View style={styles.container}>
          {rangeOptions.WEEK.map(option => (<TouchableOpacity
            key={option.id}
            onPress={() => {
              that.props.navigation.setParams({
                checkWeek: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });

              that.setState({
                checkWeek: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });
            }}
          >
            <View style={styles.row}>
              <View>
                <Text>{option.name}</Text>
                <Text style={styles.dateText}>{`${moment(option.startDate).format('DD MMMM')} - ${moment(option.endDate).format('DD MMMM')}`}</Text>
              </View>
              {that.state.checkWeek === option.id && <Icon name="check" size={20} color="#0076FF" />}
            </View>
          </TouchableOpacity>))}
        </View>);

      case 'MONTH':
        return (<View style={styles.container}>
          {rangeOptions.MONTH.map(option => (<TouchableOpacity
            key={option.id}
            onPress={() => {
              that.props.navigation.setParams({
                checkMonth: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });

              that.setState({
                checkMonth: option.id,
                startDate: option.startDate,
                endDate: option.endDate,
              });
            }}
          >
            <View style={styles.row}>
              <View>
                <Text>{option.name}</Text>
                <Text style={styles.dateText}>{option.display}</Text>
              </View>
              {that.state.checkMonth === option.id && <Icon name="check" size={20} color="#0076FF" />}
            </View>
          </TouchableOpacity>))}
        </View>);

      case 'CUSTOM':
        return (<View style={styles.container}>
          <TouchableOpacity
            onPress={() => this.openStartDatePicker()}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.text}>Start Date</Text>
                <Text style={[styles.dateText, { color: this.state.isStartDatePickerShow ? 'red' : 'gray' }]}>{moment(startDate).format('MMM D, YYYY')}</Text>
              </View>
            </View>
          </TouchableOpacity>
          {this.state.isStartDatePickerShow && Platform.OS === 'ios' && <DatePickerIOS
            style={styles.datePicker}
            date={startDate}
            mode="date"
            timeZoneOffsetInHours={this.state.timeZoneOffsetInHours * 60}
            onDateChange={(date) => {
              const tempDate = new Date(moment([date.getFullYear(), date.getMonth(), date.getDate()]));
              this.setState({ startDate: tempDate, isChanged: true });
              setStartDate(tempDate);
              AppEventsLogger.logEvent('change-start-date', 0, { startDate: tempDate.toString() });
            }}
          />}

          <TouchableOpacity
            underlayColor="#F4F4F4"
            onPress={() => this.openEndDatePicker()}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.text}>End Date</Text>
                <Text style={[styles.dateText, { color: this.state.isEndDatePickerShow ? 'red' : 'gray' }]}>{moment(endDate).format('MMM D, YYYY')}</Text>
              </View>
            </View>
          </TouchableOpacity>
          {this.state.isEndDatePickerShow && Platform.OS === 'ios' && <DatePickerIOS
            style={styles.datePicker}
            date={endDate}
            mode="date"
            timeZoneOffsetInHours={this.state.timeZoneOffsetInHours * 60}
            onDateChange={(date) => {
              const tempDate = new Date(moment([date.getFullYear(), date.getMonth(), date.getDate()]));
              this.setState({ endDate: tempDate, isChanged: true });
              setEndDate(tempDate);
              AppEventsLogger.logEvent('change-end-date', 0, { endDate: tempDate.toString() });
            }}
          />}
        </View>);
      default:
        return null;
    }
  };

  render() {
    return (
      <TabViewAnimated
        props={this.props}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        onRequestChangeTab={this.handleChangeTab}
      />
    );
  }
}

DateSettingsView.propTypes = {
  navigation: React.PropTypes.object.isRequired,
  setRangeType: React.PropTypes.func.isRequired,
  setStartDate: React.PropTypes.func.isRequired,
  setEndDate: React.PropTypes.func.isRequired,
  startDate: React.PropTypes.object.isRequired,
  endDate: React.PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  startDate: state.dateRange.startDate,
  endDate: state.dateRange.endDate,
});

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(dateRangeActions, dispatch),
)(DateSettingsView);
