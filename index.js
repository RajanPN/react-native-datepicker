import React, {
  Component
} from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  DatePickerAndroid,
  TimePickerAndroid,
  DatePickerIOS,
  Platform,
  Animated
} from 'react-native';
import Style from './style';
import moment from 'moment';
import FloatingLabelTextInput from 'react-native-floating-label-text-input';
import tcombTemplates from '../../App/tcomb-templates';
import tcombStyles from '../../App/Styles/tcombStyles';
const dismissKeyboard = require('dismissKeyboard');

const FORMATS = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm',
  time: 'HH:mm'
};

class DatePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: this.getDate(),
      dateText: '',
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      placeholderText: this.props.placeholder
    };

    this.datePicked = this.datePicked.bind(this);
    this.onPressDate = this.onPressDate.bind(this);
    this.onPressCancel = this.onPressCancel.bind(this);
    this.onPressConfirm = this.onPressConfirm.bind(this);
    this.onDatePicked = this.onDatePicked.bind(this);
    this.onTimePicked = this.onTimePicked.bind(this);
    this.onDatetimePicked = this.onDatetimePicked.bind(this);
    this.onDatetimeTimePicked = this.onDatetimeTimePicked.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
  }

  componentWillMount() {
    // ignore the warning of Failed propType for date of DatePickerIOS, will remove after being fixed by official
    console.ignoredYellowBox = [
      'Warning: Failed propType'
      // Other warnings you don't want like 'jsSchedulingOverhead',
    ];
  }

  setModalVisible(visible) {
    const {
      height,
      duration
    } = this.props;

    this.setState({
      modalVisible: visible
    });

    // slide animation
    if (visible) {
      Animated.timing(
        this.state.animatedHeight, {
          toValue: height,
          duration
        }
      ).start();
    } else {
      this.setState({
        animatedHeight: new Animated.Value(0)
      });
    }
  }

  onStartShouldSetResponder(e) {
    return true;
  }

  onMoveShouldSetResponder(e) {
    return true;
  }

  onPressCancel() {
    this.setModalVisible(false);
  }

  onPressConfirm() {
    this.datePicked();
    this.setModalVisible(false);
  }

  getDate(date = this.props.date) {
    const {
      mode,
      minDate,
      maxDate,
      format = FORMATS[mode]
    } = this.props;

    // date默认值
    if (!date) {
      const now = new Date();
      if (minDate) {
        const _minDate = this.getDate(minDate);

        if (now < _minDate) {
          return _minDate;
        }
      }

      if (maxDate) {
        const _maxDate = this.getDate(maxDate);

        if (now > _maxDate) {
          return _maxDate;
        }
      }

      return now;
    }

    if (date instanceof Date) {
      return date;
    }

    return moment(date, format).toDate();
  }

  getDateStr(date = this.props.date) {
    const {
      mode,
      format = FORMATS[mode]
    } = this.props;

    if (date instanceof Date) {
      return moment(date).format(format);
    }
    return moment(this.getDate(date)).format(format);
  }

  datePicked() {
    if (typeof this.props.onDateChange === 'function') {
      this.props.onDateChange(this.getDateStr(this.state.date), this.state.date);
    }
  }

  getTitleElement() {
    const {
      date,
      placeholder,
      customStyles
    } = this.props;

    if (!date && placeholder) {
      return (
        <Text style={[Style.placeholderText, customStyles.placeholderText]}>{placeholder}</Text>);
    }
    return (<Text style={[Style.dateText, customStyles.dateText]}>{this.getDateStr()}</Text>);
  }

  onDatePicked({
    action,
    year,
    month,
    day
  }) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day),
        dateText: this.getDateStr(new Date(year, month, day))
      });
      this.datePicked();
    }
  }

  onTimePicked({
    action,
    hour,
    minute
  }) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: moment().hour(hour).minute(minute).toDate()
      });
      this.datePicked();
    }
  }

  onDatetimePicked({
    action,
    year,
    month,
    day
  }) {
    const {
      mode,
      format = FORMATS[mode],
      is24Hour = !format.match(/h|a/)
    } = this.props;

    if (action !== DatePickerAndroid.dismissedAction) {
      const timemoment = moment(this.state.date);

      TimePickerAndroid.open({
        hour: timemoment.hour(),
        minute: timemoment.minutes(),
        is24Hour
      }).then(this.onDatetimeTimePicked.bind(this, year, month, day));
    }
  }

  onDatetimeTimePicked(year, month, day, {
    action,
    hour,
    minute
  }) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day, hour, minute)
      });
      this.datePicked();
    }
  }

  onPressDate() {
    if (this.props.disabled) {
      return true;
    }

    // reset state
    this.setState({
      date: this.getDate()
    });

    if (Platform.OS === 'ios') {
      this.setModalVisible(true);
    } else {
      const {
        mode,
        format = FORMATS[mode],
        minDate,
        maxDate,
        is24Hour = !format.match(/h|a/)
      } = this.props;

      // 选日期
      if (mode === 'date') {
        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate)
        }).then(this.onDatePicked);
      } else if (mode === 'time') {
        // 选时间

        const timemoment = moment(this.state.date);

        TimePickerAndroid.open({
          hour: timemoment.hour(),
          minute: timemoment.minutes(),
          is24Hour
        }).then(this.onTimePicked);
      } else if (mode === 'datetime') {
        // 选日期和时间

        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate)
        }).then(this.onDatetimePicked);
      }
    }
  }

  render() {
    const {
      mode,
      style,
      cancelBtnText,
      customStyles,
      disabled,
      showIcon,
      iconSource,
      maxDate,
      minDate,
      minuteInterval,
      timeZoneOffsetInMinutes,
      confirmBtnText
    } = this.props;

    const dateInputStyle = [
      Style.dateInput, customStyles.dateInput,
      disabled && Style.disabled,
      disabled && customStyles.disabled
    ];

    return (
      <FloatingLabelTextInput
          editable = {false}
          onFocus = {() => {
            this.onPressDate();
            dismissKeyboard();
          }}
          placeholder = {this.state.placeholderText}
          style = {tcombStyles.floatinglabeltextbox.normal}
          underlayColor = {'transparent'}
          value = {this.state.dateText}
      >
      <View style={[Style.dateTouchBody, customStyles.dateTouchBody]}>
          <View style={dateInputStyle}>
            {this.getTitleElement()}
          </View>
          {showIcon && <Image
              source={iconSource}
              style={[Style.dateIcon, customStyles.dateIcon]}
                       />}
          {Platform.OS === 'ios' && <Modal
              onRequestClose={() => { this.setModalVisible(false); }}
              transparent
              visible={this.state.modalVisible}
                                    >
            <View
                style={{ flex: 1 }}
            >
              <TouchableHighlight
                  activeOpacity={1}
                  onPress={this.onPressCancel}
                  style={Style.datePickerMask}
                  underlayColor={'#00000077'}
              >
                <TouchableHighlight
                    underlayColor={'#fff'}
                    style={{ flex: 1 }}
                >
                  <Animated.View
                      style={[Style.datePickerCon,
                        { height: this.state.animatedHeight }, customStyles.datePickerCon]}
                  >
                    <DatePickerIOS
                        date={this.state.date}
                        maximumDate={maxDate && this.getDate(maxDate)}
                        minimumDate={minDate && this.getDate(minDate)}
                        minuteInterval={minuteInterval}
                        mode={mode}
                        onDateChange={date => this.setState({ date })}
                        style={[Style.datePicker, customStyles.datePicker]}
                        timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
                    />
                    <TouchableHighlight
                        onPress={this.onPressCancel}
                        style={[Style.btnText, Style.btnCancel, customStyles.btnCancel]}
                        underlayColor={'transparent'}
                    >
                      <Text
                          style={
                            [Style.btnTextText, Style.btnTextCancel, customStyles.btnTextCancel]}
                      >
                        {cancelBtnText}
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={this.onPressConfirm}
                        style={[Style.btnText, Style.btnConfirm, customStyles.btnConfirm]}
                        underlayColor={'transparent'}
                    >
                      <Text
                          style={[Style.btnTextText, customStyles.btnTextConfirm]}
                      >{confirmBtnText}</Text>
                    </TouchableHighlight>
                  </Animated.View>
                </TouchableHighlight>
              </TouchableHighlight>
            </View>
          </Modal>}
        </View> < /FloatingLabelTextInput>
    );
  }
}

DatePicker.defaultProps = {
  mode: 'date',
  date: '',
  // component height: 216(DatePickerIOS) + 1(borderTop) + 42(marginTop), IOS only
  height: 259,

  // slide animation duration time, default to 300ms, IOS only
  duration: 300,
  confirmBtnText: '确定',
  cancelBtnText: '取消',
  iconSource: require('./date_icon.png'),
  customStyles: {},

  // whether or not show the icon
  showIcon: true,
  disabled: false,
  placeholder: '',
  modalOnResponderTerminationRequest: e => true
};

DatePicker.propTypes = {
  cancelBtnText: React.PropTypes.string,
  confirmBtnText: React.PropTypes.string,
  customStyles: React.PropTypes.object,
  date: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  disabled: React.PropTypes.bool,
  duration: React.PropTypes.number,
  format: React.PropTypes.string,
  height: React.PropTypes.number,
  iconSource: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.object]),
  is24Hour: React.PropTypes.bool,
  maxDate: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  minDate: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  modalOnResponderTerminationRequest: React.PropTypes.func,
  mode: React.PropTypes.oneOf(['date', 'datetime', 'time']),
  onDateChange: React.PropTypes.func,
  placeholder: React.PropTypes.string,
  showIcon: React.PropTypes.bool
};

export default DatePicker;
