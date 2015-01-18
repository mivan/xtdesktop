/*
 * This file is part of the xTuple ERP: PostBooks Edition, a free and
 * open source Enterprise Resource Planning software suite,
 * Copyright (c) 1999-2015 by OpenMFG LLC, d/b/a xTuple.
 * It is licensed to you under the Common Public Attribution License
 * version 1.0, the full text of which (including xTuple-specific Exhibits)
 * is available at www.xtuple.com/CPAL.  By using this software, you agree
 * to be bound by its terms.
 */

function setupDesktopMenu() {

  _mainMenu = mainwindow.findChild("_mainMenu");
  _shortcutMenu = mainwindow.findChild("_shortcutMenu");
  _employeeImage = mainwindow.findChild("_employeeImage");
  _employee = mainwindow.findChild("_employee");

  _mainMenu.addColumn(qsTr("MAIN MENU"), -1, Qt.AlignLeft, true, "menuItem");
  var _style = _globalStyle + '\nselection-color: rgb(36, 146, 222);\nselection-background-color: rgb(255, 255, 255);\nXTreeWidget::branch { border-image: none; };';
  _mainMenu.setStyleSheet(_style);
  _shortcutMenu.setStyleSheet(_style);
  _mainMenu.alternatingRowColors = false;
  _shortcutMenu.alternatingRowColors = false;
  _shortcutMenu.maximumHeight = 150;
  _shortcutMenu.addColumn(qsTr("SHORTCUTS"), -1, Qt.AlignLeft, true, "menuShortcuts");
  var _sc = toolbox.executeDbQuery("desktop", "userShortcuts", new Object);

// Populate shortcuts menu per Teeview item so it matches Main Menu visually
  while(_sc.next()) {
    var menuItem = new XTreeWidgetItem(_shortcutMenu, _sc.value("usrpref_id"), _sc.value("usrpref_id"), _sc.value("menuShortcuts"));
  }

  var _sqlImage = "SELECT crmacct_name, crmacct_usr_username, emp.emp_image_id "
              + "  FROM emp JOIN crmacct ON (emp_id=crmacct_emp_id) "
              + "  WHERE crmacct_usr_username = geteffectivextuser();";
  var _employeeData = toolbox.executeQuery(_sqlImage);
  if (_employeeData.first()){
    _employeeImage.setId(_employeeData.value("emp_image_id"));
    _employee.text = _employeeData.value("crmacct_name");
    _employee.wordWrap = true;
  }
  _employee.setStyleSheet('font: 75 bold 10pt "Verdana";');

  _mainMenu["itemClicked(XTreeWidgetItem*, int)"].connect(mainMenuClicked);
  _shortcutMenu["itemClicked(XTreeWidgetItem*, int)"].connect(shortcutMenuClicked);

}

function mainMenuClicked(wdgt, item) {
  _shortcutMenu.setCurrentItem(-1);
  _desktopStack.currentIndex = (wdgt.id() - 1);
}

function shortcutMenuClicked(wdgt, item) {
  _mainMenu.setCurrentItem(-1);
  var param = new Object;
  param.action = wdgt.id();

  var _actionSQL = "SELECT usrpref_value FROM usrpref "
		+ " WHERE (usrpref_username = geteffectivextuser() "
                 + " and usrpref_id = <? value('action') ?>);";
  var _scAction = toolbox.executeQuery(_actionSQL, param);
  if (_scAction.first()){
    var priv = mainwindow.findChild(_scAction.value("usrpref_value"));
    if (priv && priv.enabled)
      mainwindow.findChild(_scAction.value("usrpref_value")).trigger();
    else
      QMessageBox.information(mainwindow, qsTr("Insufficient Privileges"), qsTr("You have insufficient permissions for this action"));
  } else {
    QMessageBox.critical(mainwindow, qsTr("Error"), qsTr("Could not find the shortcut action"));
    return false;
  }
}
